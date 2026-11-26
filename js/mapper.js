/* Turns the flat rows of customer_profile_360_view into the customer model the screen draws.
   Every attribute is kept: each customer, policy, vehicle, endorsement, member and payment carries a `raw` object
   with all of its columns (null when the API sent nothing), and the screen lists them under "All attributes". */
window.Agent360Mapper = (function () {
  const CFG = window.AGENT360_CONFIG, COLS = window.VIEW_COLUMNS, LK = window.LOOKUPS || {};

  const isNull = v => v === null || v === undefined || CFG.nullTokens.includes(typeof v === "string" ? v.trim() : v);
  const g = (r, k) => isNull(r[k]) ? null : r[k];
  const num = v => { if (isNull(v)) return null; const n = Number(v); return isNaN(n) ? null : n; };
  const yes = v => !isNull(v) && /^(1|y|yes|true)$/i.test(String(v));
  const colsOf = prefixes => COLS.filter(c => prefixes.includes(c.prefix)).map(c => c.name);
  const pick = (rows, prefixes) => { const o = {}; colsOf(prefixes).forEach(c => { const r = rows.find(r => !isNull(r[c])); o[c] = r ? r[c] : null; }); return o; };
  const groupBy = (rows, keyFn) => { const m = new Map(); rows.forEach(r => { const k = keyFn(r); if (k === null || k === undefined) return; (m.get(String(k)) || m.set(String(k), []).get(String(k))).push(r); }); return m; };
  const lk = (table, code) => isNull(code) ? null : ((LK[table] || {})[code] || "Code " + code);
  const maskChassis = v => isNull(v) ? null : String(v).slice(0, 9) + "••••" + String(v).slice(-2);
  const today = () => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; };
  const ymd = v => isNull(v) ? null : String(v).slice(0, 10);
  const daysSince = v => isNull(v) ? null : Math.max(0, Math.floor((today() - new Date(v)) / 864e5));
  const ageText = d => d === null ? "Date not available" : d === 0 ? "Today" : d < 14 ? d + "d open" : Math.round(d / 7) + "w open";

  function motorPolicy(no, rs) {
    const D = CFG.dateColumns, raw = pick(rs, ["plcmt", "plcd", "plcrm", "psts", "pdsc"]);
    const pd = [...groupBy(rs, r => g(r, "pdsc_decisionid")).values()].map(x => x[0]);
    const adj = pd.length ? pd.reduce((n, r) => n + (num(g(r, "pdsc_amount")) || 0) * (/discount/i.test(g(r, "pdsc_transactiontype") || "") ? -1 : 1), 0) : null;
    const vehicles = [...groupBy(rs, r => g(r, "vhc_vehicleid")).values()].map(vr => {
      const v = pick(vr, ["vhc", "vhcp", "pth"]);
      return { model: lk("model", v.vhc_modelid), year: num(v.vhc_yearofmanufacture), plate: v.pth_platenum, chassis: maskChassis(v.vhc_chassisnum),
               color: lk("color", v.vhc_vehiclecolor), usage: v.vhc_vehicleusage, seats: num(v.vhc_seatcapacity), raw: v };
    });
    const endorsements = [...groupBy(rs, r => g(r, "end_mot_endt_no")).entries()].map(([n, er]) => {
      const e = pick(er, ["end_mot"]);
      return { no: n, date: ymd(e.end_mot_endt_date), desc: e.end_mot_endt_desc, type: e.end_mot_endt_type, final: e.end_mot_final_flag, approved: e.end_mot_approved,
               entered: ymd(e.end_mot_entry_date), updated: ymd(e.end_mot_last_update_date), raw: e };
    });
    return { no, status: raw.psts_reason || (raw.psts_statusid !== null ? "Status " + raw.psts_statusid : null), reason: "", lob: lk("lob", raw.plcmt_lob_code), option: lk("option", raw.plcd_productoptionid),
      issued: ymd(raw.plcmt_date_iss), from: ymd(raw[D.motorStart]), to: ymd(raw[D.motorEnd]),
      premium: num(raw.plcd_totalcontribution), basic: num(raw.plcrm_totalbasiccontribution), adj, ncb: raw.plcmt_no_clm_bns_flg, renewal: num(raw.plcmt_rnwl_prem),
      vehicle: vehicles[0] || {}, vehicles, endorsements, ledger: [], raw };
  }

  function medgoPolicy(no, rs) {
    const D = CFG.dateColumns, raw = pick(rs, ["plc_mdg"]);
    const members = [...groupBy(rs, r => g(r, "mem_member_code") || g(r, "mem_id_no") || g(r, "mem_iqama_no")).values()].map(mr => {
      const m = pick(mr, ["mem"]);
      return { code: m.mem_member_code, nameEn: m.mem_e_name, nameAr: m.mem_a_name, type: m.mem_mem_type, sex: m.mem_sex, from: ymd(m.mem_date_from), to: ymd(m.mem_date_to),
               active: yes(m.mem_active) ? "Y" : "N", card: yes(m.mem_card_issued) ? "Y" : "N", idNo: m.mem_id_no || m.mem_iqama_no, nat: lk("nationality", m.mem_nationality_code), raw: m };
    });
    const endorsements = [...groupBy(rs, r => g(r, "end_mdg_endt_no")).entries()].map(([n, er]) => {
      const e = pick(er, ["end_mdg"]);
      return { no: n, date: ymd(e.end_mdg_endt_date), desc: e.end_mdg_endt_desc, sub: e.end_mdg_endt_sub_type, type: e.end_mdg_endt_type_desc || e.end_mdg_endt_type,
               delta: num(e.end_mdg_ttl_cont), final: e.end_mdg_final_flag, approved: e.end_mdg_approved, approver: e.end_mdg_approval_user, source: e.end_mdg_source_code, cancel: e.end_mdg_policy_cancel, raw: e };
    });
    return { no, branch: lk("branch", raw.plc_mdg_branch_code), sponsor: raw.plc_mdg_e_name, sponsorAr: raw.plc_mdg_a_name, issued: ymd(raw.plc_mdg_date_iss),
      from: ymd(raw[D.medgoStart]), to: ymd(raw[D.medgoEnd]), plan: members.length && members[0].raw.mem_class_no ? "Class " + members[0].raw.mem_class_no : null,
      claims: num(raw.plc_mdg_ttl_claims), endtTotal: num(raw.plc_mdg_ttl_endt), currency: raw.plc_mdg_currency_code, members, endorsements, ledger: [], raw };
  }

  /* Rules that can be checked from the columns alone. Their status is not in the data, so it shows as Detected. */
  function deriveExceptions(c) {
    const out = [], add = x => out.push({ id: "AUTO-" + (out.length + 1), status: "Detected", sev: "Medium", policy: "", ...x });
    if (!c.mdmId) add({ line: "Customer", ref: "Golden record", title: "Customer not matched to a golden record", sev: "High", age: "Date not available",
      rule: "Both psn_businessid and cli_mdmid are empty.", ar: "لا يوجد رقم موحد للعميل في نظام إدارة البيانات الرئيسية. نرجو التحقق من بيانات التواصل مع العميل.", en: "This customer has no golden ID. Please confirm the contact details with the customer." });
    if (c.idExpiry && new Date(c.idExpiry) < today()) add({ line: "Customer", ref: c.idType, title: c.idType + " has expired", age: ageText(daysSince(c.idExpiry)).replace(" open", " expired"),
      rule: "cli_id_expiry_date is earlier than today.", ar: "انتهت صلاحية الهوية. نرجو تزويدنا بنسخة محدثة.", en: "The ID on file has expired. Please share the renewed ID." });
    if (c.nameEn && c.cli_nameEn && c.nameEn.trim().toLowerCase() !== c.cli_nameEn.trim().toLowerCase()) add({ line: "Customer", ref: "Name", title: "Name differs between Motor core and MDM", age: "Date not available",
      rule: "psn_fullname does not match cli_e_full_name or cli_e_name.", ar: "يوجد اختلاف في الاسم بين النظامين. نرجو تأكيد الاسم مع العميل.", en: "The name differs between the two systems. Please confirm it with the customer." });
    [["Motor", c.motorPolicies, "end_mot_final_flag"], ["Medgo", c.medgoPolicies, "end_mdg_final_flag"]].forEach(([line, list, col]) => list.forEach(p => p.endorsements.forEach(e => {
      if (String(e.final).toUpperCase() === "N") add({ line, policy: p.no, ref: e.no, title: "Endorsement not finalised", age: ageText(daysSince(e.entered || e.date)),
        rule: col + " = N for " + e.no + ".", ar: "لم يكتمل إصدار الملحق بعد. نرجو تزويدنا بالمستندات المطلوبة.", en: "The endorsement is not finalised yet. Please send the documents we asked for." });
    })));
    return out;
  }

  function map(rows, idNo) {
    const cust = pick(rows, ["cli", "psn"]);
    const mdm = cust.psn_businessid || cust.cli_mdmid;
    const nameEn = cust.psn_fullname || cust.cli_e_full_name || cust.cli_e_name || "Name not available";
    const parts = nameEn.trim().split(/\s+/);
    const c = {
      custId: cust.cli_cust_id, mdmId: mdm || "", idType: String(idNo)[0] === "2" ? "Iqama" : "National ID", idNo: cust.psn_x_infac360in_governmentid || idNo, idExpiry: ymd(cust.cli_id_expiry_date),
      nameEn, cli_nameEn: cust.cli_e_full_name || cust.cli_e_name, nameAr: cust.psn_x_ar_fullname || cust.cli_a_full_name || cust.cli_a_name,
      init: ((parts[0] || "?")[0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase(), type: lk("custType", cust.cli_cust_type), nationality: lk("nationality", cust.cli_nationality_code),
      since: isNull(cust.cli_insert_date) ? null : String(cust.cli_insert_date).slice(0, 4), mobile: cust.cli_mobile_no, email: cust.cli_email, vip: yes(cust.psn_x_is_vip), blacklist: yes(cust.cli_blacklist_flag),
      group: cust.cli_client_group_id, channel: cust.cli_channel_name, salesman: cust.cli_salesman_code, licenceExpiry: ymd(cust.cli_licence_expiry_date), balance: num(cust.cli_balance), raw: cust,
      motorPolicies: [...groupBy(rows, r => g(r, "plcmt_policy_no") || g(r, "end_mot_policy_no") || g(r, "plcd_policyid")).entries()].map(([no, rs]) => motorPolicy(no, rs)),
      medgoPolicies: [...groupBy(rows, r => g(r, "plc_mdg_policy_no") || g(r, "end_mdg_policy_no")).entries()].map(([no, rs]) => medgoPolicy(no, rs)),
      exceptions: []
    };
    /* Payments: arx rows go to the policy whose number they carry. */
    const all = [...c.motorPolicies, ...c.medgoPolicies];
    groupBy(rows, r => g(r, "arx_trx_no")).forEach(rs => {
      const a = pick(rs, ["arx"]), p = all.find(p => p.no === String(a.arx_policy_no));
      if (p) p.ledger.push({ no: a.arx_trx_no, type: a.arx_trx_type, sub: a.arx_trx_sub_type, date: ymd(a.arx_trx_date), dc: /^(d|y|1)/i.test(String(a.arx_debit)) ? "D" : "C", amount: num(a.arx_amount) || 0, final: a.arx_final_flag, raw: a });
    });
    c.exceptions = deriveExceptions(c);
    return c;
  }

  return { map, isNull, colsOf };
})();
