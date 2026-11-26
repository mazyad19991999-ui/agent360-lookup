/* Builds data/columns.js, data/mock_rows.js and data/lookups.js.
   Run: node tools/gen_mock.js
   The mock rows copy the shape of customer_profile_360_view: one flat row, 432 columns, null where a value is missing.
   Row for 1070670821 is the real sample record shared by the Denodo team. The other customers are invented. */
const fs = require("fs"), path = require("path");
global.window = {};
require("./dummy_source.js");
const sample = JSON.parse(fs.readFileSync(path.join(__dirname, "sample.json"), "utf8"));
const COLS = sample.columns;
const blank = () => Object.fromEntries(COLS.map(c => [c, null]));

const nat = { Saudi:9001, Egyptian:9002, Pakistani:9003 };   /* mock codes sit in the 9000 range so they never match a real code */
const lobCode = { "Comprehensive":"COMP", "Third Party Liability":"TP" };
const models = {}, colors = {}, branches = {}, options = {};
let mk = 400, ck = 60, bk = 100;
const code = (map, name, start) => (map[name] = map[name] || (start.v++)); 
const ctr = { m:{v:9001}, c:{v:9001}, b:{v:9001} };
const statusId = { ACTIVE:3, EXPIRED:4, CANCELLED:5 };
const motorDates = {
  "POL-MTR-77120":["2026-03-15","2027-03-14"], "POL-MTR-61004":["2025-03-15","2026-03-14"], "POL-MTR-83390":["2026-07-22","2027-07-21"],
  "POL-MTR-70415":["2025-01-05","2025-07-04"], "POL-MTR-33018":["2024-09-01","2025-08-31"] };
const ext = {};                         /* extra mock values outside the 432 columns (proposed columns) */
const rowsById = {};

window.CUSTOMERS.forEach(c => {
  const grp = (c.group.match(/\((.*)\)/) || [])[1] || c.group;
  const cust = () => {
    const r = blank();
    Object.assign(r, {
      cli_cust_id:+c.custId, psn_businessid:c.mdmId || null, psn_x_infac360in_governmentid:c.idNo, cli_id_no:c.idNo, cli_gdp_no:c.idNo,
      cli_id_type:c.idType, cli_id_expiry_date:c.idExpiry + "T00:00:00", cli_e_name:c.nameEn.toUpperCase(), cli_a_name:c.nameAr,
      psn_fullname:c.nameEn, psn_x_ar_fullname:c.nameAr, cli_cust_type:"PL", cli_nationality_code:nat[c.nationality],
      cli_insert_date:c.since + "-01-01T00:00:00", cli_mobile_no:c.mobile, cli_email:c.email, psn_x_is_vip:c.vip ? 1 : 0,
      cli_blacklist_flag:c.blacklist ? "Y" : "N", cli_client_group_id:grp, cli_channel_name:c.channel, cli_salesman_code:c.salesman,
      cli_balance:c.balance || null, cli_licence_expiry_date:c.licenceExpiry ? c.licenceExpiry + "T00:00:00" : null,
      psn_x_infac360sf_iscustomer:1, psn_x_is_vip:c.vip ? 1 : 0 });
    return r;
  };
  const rows = [];
  c.motorPolicies.forEach(p => {
    const n = Math.max(1, p.endorsements.length, (p.ledger || []).length);
    for (let i = 0; i < n; i++) {
      const r = cust(), e = p.endorsements[i], t = (p.ledger || [])[i];
      const mid = code(models, p.vehicle.model, ctr.m), col = code(colors, p.vehicle.color, ctr.c);
      options[p.option] = +p.option.replace(/\D/g, "");
      Object.assign(r, { plcmt_cust_id:+c.custId, plcmt_policy_no:p.no, plcmt_lob_code:lobCode[p.lob], plcmt_date_iss:p.issued + "T00:00:00",
        plcmt_rnwl_prem:p.renewal || null, plcmt_no_clm_bns_flg:p.ncb, plcmt_currency_code:"SR", plcmt_e_name:c.nameEn.toUpperCase(), plcmt_a_name:c.nameAr,
        plcd_productoptionid:+p.option.replace(/\D/g, ""), plcd_totalcontribution:p.premium, plcrm_totalbasiccontribution:p.basic,
        pdsc_amount:p.adj, pdsc_transactiontype:p.adj >= 0 ? "Loading" : "Discount", psts_statusid:statusId[p.status], psts_reason:p.status,
        vhc_modelid:mid, vhc_yearofmanufacture:p.vehicle.year, vhc_chassisnum:p.vehicle.chassis, vhc_vehiclecolor:col, vhc_vehicleusage:p.vehicle.usage,
        vhc_seatcapacity:p.vehicle.seats, pth_platenum:p.vehicle.plate });
      r.__ext = { plcmt_date_from:motorDates[p.no][0] + "T00:00:00", plcmt_date_to:motorDates[p.no][1] + "T00:00:00" };
      if (e) Object.assign(r, { end_mot_policy_no:p.no, end_mot_endt_no:e.no, end_mot_endt_date:e.date + "T00:00:00", end_mot_endt_desc:e.desc, end_mot_final_flag:e.final,
        end_mot_endt_type:e.type, end_mot_approved:e.approved, end_mot_entry_date:e.entered + "T00:00:00", end_mot_last_update_date:e.updated + "T00:00:00" });
      if (t) Object.assign(r, { arx_trx_no:t.no, arx_trx_type:t.type, arx_trx_sub_type:t.sub, arx_trx_date:t.date + "T00:00:00", arx_debit:t.dc === "D" ? "Y" : "N",
        arx_amount:t.amount, arx_policy_no:p.no, arx_final_flag:t.final, arx_currency_code:"SR" });
      rows.push(r);
    }
  });
  c.medgoPolicies.forEach(p => {
    const mem = p.members || [], led = p.ledger || [];
    const n = Math.max(1, p.endorsements.length, mem.length, led.length);
    const bcode = code(branches, p.branch, ctr.b), quo = "Q" + p.no.replace(/\D/g, "");
    for (let i = 0; i < n; i++) {
      const r = cust(), e = p.endorsements[i], m = mem[i], t = led[i];
      Object.assign(r, { plc_mdg_cust_id:+c.custId, plc_mdg_policy_no:p.no, plc_mdg_quotation_no:quo, plc_mdg_branch_code:bcode, plc_mdg_e_name:p.sponsor, plc_mdg_a_name:p.sponsorAr,
        plc_mdg_date_iss:p.issued + "T00:00:00", plc_mdg_date_from:p.from + "T00:00:00", plc_mdg_date_to:p.to + "T00:00:00", plc_mdg_ttl_claims:p.claims, plc_mdg_ttl_endt:p.endtTotal,
        plc_mdg_currency_code:p.currency });
      if (e) Object.assign(r, { end_mdg_branch_code:bcode, end_mdg_policy_no:p.no, end_mdg_endt_no:e.no, end_mdg_endt_date:e.date + "T00:00:00", end_mdg_endt_desc:e.desc,
        end_mdg_endt_sub_type:e.sub, end_mdg_endt_type:e.type, end_mdg_ttl_cont:e.delta, end_mdg_final_flag:e.final, end_mdg_approved:e.approved,
        end_mdg_approval_user:e.approver || null, end_mdg_source_code:e.source, end_mdg_policy_cancel:e.cancel });
      if (m) Object.assign(r, { mem_branch_code:bcode, mem_quotation_no:quo, mem_class_no:p.plan.replace("Class ", ""), mem_member_code:m.code, mem_e_name:m.nameEn, mem_a_name:m.nameAr,
        mem_mem_type:m.type, mem_sex:m.sex, mem_birth_date:m.dob + "T00:00:00", mem_date_from:m.from + "T00:00:00", mem_date_to:m.to + "T00:00:00", mem_active:m.active,
        mem_card_issued:m.card, mem_id_no:m.idNo && m.idNo[0] === "1" ? m.idNo : null, mem_iqama_no:m.idNo && m.idNo[0] === "2" ? m.idNo : null,
        mem_id_expiry_date:m.idExp ? m.idExp + "T00:00:00" : null, mem_nationality_code:nat[m.nat] || null });
      if (t) Object.assign(r, { arx_branch_code:bcode, arx_trx_no:t.no, arx_trx_type:t.type, arx_trx_sub_type:t.sub, arx_trx_date:t.date + "T00:00:00", arx_debit:t.dc === "D" ? "Y" : "N",
        arx_amount:t.amount, arx_policy_no:p.no, arx_final_flag:t.final, arx_currency_code:"SR" });
      rows.push(r);
    }
  });
  if (!rows.length) rows.push(cust());
  rowsById[c.idNo] = rows;
});
/* The real sample record from Denodo. */
const sampleRows = [Object.assign(blank(), sample.record)];
const exStore = Object.fromEntries(window.CUSTOMERS.map(c => [c.idNo, c.exceptions.map(x => ({ id:x.id, key:x.id, line:x.line, policy:x.policy, ref:x.ref, title:x.title, sev:x.sev, status:x.status, age:x.age, detected:x.rule, ar:x.ar, en:x.en }))]));


const invert = o => Object.fromEntries(Object.entries(o).map(([k, v]) => [v, k]));
const lookups = {
  _note:"MOCK lookups. Codes in the 9000 range are invented. Real names come from Tawuniya lookup tables. Anything missing shows as the raw code. lob TP and COMP are assumed meanings, please confirm.",
  lob:{ COMP:"Comprehensive", TP:"Third Party Liability" }, model:invert(models), color:invert(colors), branch:invert(branches), option:invert(options),
  nationality:invert(nat), motorStatus:invert(statusId), group:{ "G-20418":"Najd Trading Co.", "G-11875":"Gulf Logistics Co." }
};
const trim = o => Object.fromEntries(Object.entries(o).filter(([k, v]) => v !== null));
Object.keys(rowsById).forEach(k => rowsById[k] = rowsById[k].map(trim));
const out = (f, s) => fs.writeFileSync(path.join(__dirname, "..", "data", f), s);
out("columns.js", "/* All 432 columns of customer_profile_360_view, in view order. */\nwindow.ALL_COLUMNS = " + JSON.stringify(COLS) + ";\n");
out("mock_rows.js", "/* MOCK API response: flat rows from customer_profile_360_view (null values left out to save space, js/api.js fills them back), keyed by National ID or Iqama number.\n   The others are invented. The real sample record is in backup_sample.js. __ext holds proposed columns that are not in the view yet. */\nwindow.MOCK_ROWS = " + JSON.stringify(rowsById) + ";\n/* Exceptions as shown to Rami. The real view has no exception table. */\nwindow.MOCK_EXCEPTIONS = " + JSON.stringify(exStore) + ";\n");
out("backup_sample.js", "/* BACKUP: the real sample record from the Denodo API. js/api.js uses it when the live API cannot be reached. Contains customer data, keep inside the project team. */\nwindow.BACKUP_ROWS = " + JSON.stringify(sampleRows.map(trim)) + ";\n");
out("lookups.js", "window.LOOKUPS = " + JSON.stringify(lookups, null, 1) + ";\n");
console.log(Object.keys(rowsById).map(k => k + ":" + rowsById[k].length).join(" "));
