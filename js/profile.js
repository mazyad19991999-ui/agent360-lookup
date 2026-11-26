/* Turns the flat rows of customer_profile_360_view into one customer profile.
   The view repeats a customer on many rows (policy x endorsement x member x payment), so everything is grouped by key.
   Every column is kept in `raw`, so nothing from the API is dropped. */
(function () {
  const F = () => window.AGENT360.fields, R = () => window.AGENT360.rules;
  const isNull = v => v === null || v === undefined || v === "" || v === "<null>";
  const PREFIX = {
    customer: ["cli_", "psn_"],
    motor: ["plcmt_", "plcd_", "plcrm_", "psts_", "vhc_", "vhcp_", "pth_"],
    adjustment: ["pdsc_"],
    motorEnd: ["end_mot_"],
    medgo: ["plc_mdg_"],
    medgoEnd: ["end_mdg_"],
    member: ["mem_"],
    payment: ["arx_"]
  };
  const cols = (kind) => window.ALL_COLUMNS.filter(c => PREFIX[kind].some(p => c.startsWith(p)))
    .concat(kind === "motor" ? window.AGENT360.proposedColumns.filter(c => c.startsWith("plcmt_")) : []);

  /* First non-null value of each column across the rows of one entity. */
  function merge(kind, rows) {
    const out = {};
    cols(kind).forEach(c => { const hit = rows.find(r => !isNull(r[c])); out[c] = hit ? hit[c] : null; });
    return out;
  }
  const pick = (raw, names) => { for (const n of [].concat(names)) if (!isNull(raw[n])) return raw[n]; return null; };
  const str = v => String(v);
  const day = v => { if (isNull(v)) return null; const d = new Date(v); return isNaN(d) ? null : d; };
  const daysSince = v => { const d = day(v); return d ? Math.max(0, Math.floor((Date.now() - d.getTime()) / 864e5)) : null; };

  /* Active when today is between start and end date (both days included). Missing dates give "Unknown". */
  function dateState(from, to) {
    const a = day(from), b = day(to);
    if (!a || !b) return { active:false, unknown:true, label:"Status unknown: start or end date is Null" };
    const t = new Date(); t.setHours(0, 0, 0, 0);
    if (t < a) return { active:false, unknown:false, label:"Inactive: Not started yet" };
    if (t > b) return { active:false, unknown:false, label:"Inactive: Expired" };
    return { active:true, unknown:false, label:"Active" };
  }

  function groupBy(rows, keyFn, build) {
    const map = new Map();
    rows.forEach(r => { const k = keyFn(r); if (isNull(k)) return; const key = str(k); if (!map.has(key)) map.set(key, []); map.get(key).push(r); });
    return [...map.entries()].map(([k, rs]) => build(k, rs));
  }

  function build(rows, storedExceptions) {
    const f = F(), mf = f.motor, gf = f.medgo;
    const customer = merge("customer", rows);

    /* Motor policies */
    const motor = groupBy(rows, r => r[mf.key], (key, rs) => {
      const raw = merge("motor", rs);
      const adjustments = groupBy(rs, r => r.pdsc_decisionid, (k, x) => merge("adjustment", x));
      const endorsements = groupBy(rs.filter(r => str(r[mf.endorsementPolicy] ?? key) === key), r => r[mf.endorsementKey], (k, x) => ({ key:k, raw:merge("motorEnd", x) }));
      return { line:"Motor", key, raw, adjustments, endorsements, payments:[], state:dateState(raw[mf.from], raw[mf.to]) };
    });

    /* Medgo policies, with their members (linked by quotation number) */
    const medgo = groupBy(rows, r => r[gf.key], (key, rs) => {
      const raw = merge("medgo", rs);
      const endorsements = groupBy(rs.filter(r => str(r[gf.endorsementPolicy] ?? key) === key), r => r[gf.endorsementKey], (k, x) => ({ key:k, raw:merge("medgoEnd", x) }));
      return { line:"Medgo", key, raw, endorsements, members:[], payments:[], state:dateState(raw[gf.from], raw[gf.to]) };
    });
    const medgoByQuotation = new Map(medgo.filter(p => !isNull(p.raw[gf.quotation])).map(p => [str(p.raw[gf.quotation]), p]));
    const seenMember = new Set();
    rows.forEach(r => {
      const code = r[f.member.key]; if (isNull(code)) return;
      const q = r[f.member.quotation];
      const owner = (!isNull(q) && medgoByQuotation.get(str(q))) || medgo.find(p => !isNull(r[gf.key]) && p.key === str(r[gf.key]));
      const id = str(code) + "|" + str(q);
      if (!owner || seenMember.has(id)) return;
      seenMember.add(id);
      owner.members.push({ key:str(code), raw:merge("member", rows.filter(x => str(x[f.member.key]) === str(code) && str(x[f.member.quotation]) === str(q))) });
    });

    /* Payments, linked by policy number */
    const all = [...motor, ...medgo], seenPay = new Set();
    rows.forEach(r => {
      const k = r[f.payment.key]; if (isNull(k)) return;
      const pol = all.find(p => !isNull(r[f.payment.policy]) && p.key === str(r[f.payment.policy]));
      const id = str(k) + "|" + str(r[f.payment.policy]);
      if (!pol || seenPay.has(id)) return;
      seenPay.add(id);
      pol.payments.push({ key:str(k), raw:merge("payment", rows.filter(x => str(x[f.payment.key]) === str(k) && str(x[f.payment.policy]) === str(r[f.payment.policy]))) });
    });

    /* Header values */
    const idNo = pick(customer, f.searchId);
    const header = {
      idNo, idType: idNo ? (str(idNo)[0] === "2" ? "Iqama" : str(idNo)[0] === "1" ? "National ID" : null) : null,
      goldenId: pick(customer, f.goldenId), nameEn: pick(customer, f.nameEn), nameAr: pick(customer, f.nameAr),
      custId: pick(customer, f.custId), vip: !isNull(customer[f.vip]) ? Number(customer[f.vip]) === 1 : null,
      blacklist: !isNull(customer[f.blacklist]) ? R().yes.includes(str(customer[f.blacklist]).toUpperCase()) : null,
      idExpiry: pick(customer, f.idExpiry), licenceExpiry: pick(customer, f.licenceExpiry), balance: pick(customer, f.balance), since: pick(customer, f.since)
    };
    const profile = { customer, header, motor, medgo, exceptions:[] };
    profile.exceptions = storedExceptions ? storedExceptions.map(x => Object.assign({}, x)) : detectExceptions(profile);
    return profile;
  }

  const endStatus = e => R().endorsementStatus({ final:e.raw[e.line === "Motor" ? "end_mot_final_flag" : "end_mdg_final_flag"], approved:e.raw[e.line === "Motor" ? "end_mot_approved" : "end_mdg_approved"] });

  /* Exceptions are derived from the columns. Each rule says which columns it used. */
  function detectExceptions(p) {
    const h = p.header, out = [], today = new Date(); today.setHours(0, 0, 0, 0);
    const add = (x) => out.push(Object.assign({ key:x.rule + "|" + x.ref, status:null }, x));
    [...p.motor, ...p.medgo].forEach(pol => {
      if (!pol.state.active && !pol.state.unknown) return;          /* only policies that can still be acted on */
      pol.endorsements.forEach(e => {
        e.line = pol.line;
        const s = endStatus(e), motor = pol.line === "Motor", pre = motor ? "end_mot_" : "end_mdg_";
        const desc = e.raw[pre + "endt_desc"] || "the endorsement", when = e.raw[motor ? "end_mot_entry_date" : "end_mdg_endt_date"];
        if (s === "Rejected") add({ rule:"REJECTED", line:pol.line, policy:pol.key, ref:e.key, sev:"High", age:daysSince(when), title:`${desc}: endorsement rejected`,
          detected:`${pre}approved shows a rejection and ${pre}final_flag is not Y. The reason is not in the API.`,
          ar:`لم تتم الموافقة على طلب التعديل (${desc}) على الوثيقة رقم ${pol.key}. نرجو تزويدنا بالمستندات المطلوبة لنتمكن من إعادة معالجته.`,
          en:`Your request (${desc}) on policy ${pol.key} was not approved. Please send us the required documents so we can process it again.` });
        else if (s !== "Completed") add({ rule:"NOT_FINAL", line:pol.line, policy:pol.key, ref:e.key, sev:"Medium", age:daysSince(when), title:`${desc}: endorsement not finalised`,
          detected:`${pre}final_flag is not Y and the endorsement is not rejected.`,
          ar:`طلب التعديل (${desc}) على الوثيقة رقم ${pol.key} لم يكتمل بعد. نرجو تزويدنا بأي مستندات مطلوبة حتى نتمكن من إتمامه.`,
          en:`Your request (${desc}) on policy ${pol.key} is not complete yet. Please send us any documents we asked for so we can finish it.` });
      });
    });
    if (day(h.idExpiry) && day(h.idExpiry) < today) add({ rule:"ID_EXPIRED", line:"Customer", policy:"", ref:h.idType || "ID", sev:"Medium", age:daysSince(h.idExpiry), title:`${h.idType || "ID"} has expired`,
      detected:"cli_id_expiry_date is before today.", ar:"نفيدكم بأن هويتكم منتهية الصلاحية. نرجو تجديدها وتحديث بياناتكم لدينا.", en:"Our records show your ID has expired. Please renew it so we can update your details." });
    if (isNull(h.goldenId)) add({ rule:"NO_GOLDEN", line:"Customer", policy:"", ref:str(h.idNo), sev:"High", age:null, title:"Customer not matched to a golden record",
      detected:"psn_businessid and cli_mdmid are both Null.", ar:"لم نتمكن من مطابقة بياناتكم بالكامل. نرجو تأكيد رقم الجوال والبريد الإلكتروني المسجلين لدينا.", en:"We could not fully match your details. Please confirm the mobile number and email we hold for you." });
    if (!isNull(h.balance) && Number(h.balance) > 0) add({ rule:"BALANCE", line:"Customer", policy:"", ref:str(h.custId), sev:"High", age:null, title:"Outstanding account balance",
      detected:"cli_balance is greater than 0.", ar:`يوجد رصيد مستحق على حسابكم بمبلغ ${Number(h.balance).toLocaleString("en-US")} ريال. نرجو السداد في أقرب وقت ممكن.`, en:`There is an outstanding balance of SAR ${Number(h.balance).toLocaleString("en-US")} on your account. Please settle it as soon as you can.` });
    if (day(h.licenceExpiry) && day(h.licenceExpiry) < today) add({ rule:"LICENCE", line:"Customer", policy:"", ref:str(h.custId), sev:"Medium", age:daysSince(h.licenceExpiry), title:"Driving licence has expired",
      detected:"cli_licence_expiry_date is before today.", ar:"رخصة القيادة المسجلة لدينا منتهية الصلاحية. نرجو تزويدنا بالرخصة المحدثة.", en:"The driving licence we hold has expired. Please send us the renewed licence." });
    return out;
  }

  /* Looks a code up. Falls back to the raw code, or null when there is no value. */
  const lookup = (group, code) => isNull(code) ? null : ((window.LOOKUPS[group] || {})[code] ?? code);

  window.Agent360Profile = { build, isNull, lookup, endStatus, cols, PREFIX, dateState, detectExceptions };
})();
