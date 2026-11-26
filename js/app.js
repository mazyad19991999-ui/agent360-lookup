/* Agent 360 screen. Reads a profile built by js/profile.js. A value that is missing in the API is shown as Null. */
let cur = null, filter = "all";
const P = window.Agent360Profile, CFG = window.AGENT360, F = CFG.fields;
const isNull = P.isNull, lookup = P.lookup;
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));
const NUL = '<span class="nul">Null</span>';
const show = (v, fmt) => isNull(v) ? NUL : (fmt ? fmt(v) : esc(v));
const fd = v => { if (isNull(v)) return NUL; const d = new Date(v); return isNaN(d) ? esc(v) : d.toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }); };
const sar = (v, cur) => isNull(v) || isNaN(Number(v)) ? NUL : (isNull(cur) ? "SAR" : esc(cur === "SR" ? "SAR" : cur)) + " " + Number(v).toLocaleString("en-US");
const maskMob = m => isNull(m) ? NUL : esc(String(m).slice(0, 3) + "••••" + String(m).slice(-3));
const maskMail = e => isNull(e) ? NUL : esc(String(e).replace(/^(.).*(@.*)$/, "$1***$2"));
const maskId = v => isNull(v) ? NUL : esc(String(v).slice(0, 2) + "XXXXXX" + String(v).slice(-2));
const maskChassis = v => isNull(v) ? NUL : esc(String(v).length > 8 ? String(v).slice(0, 6) + "••••" + String(v).slice(-2) : v);
const tone = s => ({ Completed:"green", Active:"green", "In progress":"amber", "Pending approval":"amber", Rejected:"red", Open:"red", "Awaiting customer":"amber", Escalated:"purple" }[s] || "grey");
const pill = (t, c) => `<span class="pill ${c || tone(t)}">${esc(t)}</span>`;
const svg = d => `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const I = {
  heart:svg('<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>'),
  car:svg('<path d="M5 17h14M3 13l2-6h14l2 6v4H3zM7 17v2M17 17v2"/>'),
  shield:svg('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>'),
  off:svg('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 9l6 6M15 9l-6 6"/>'),
  doc:svg('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>'),
  alert:svg('<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>'),
  ok:svg('<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>'),
  user:svg('<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>'),
  chev:'<svg class="chev" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8l5 5 5-5"/></svg>'
};
function toast(t) { const el = document.getElementById("toast"); el.textContent = t; el.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove("on"), 1600); }
const lineName = l => ({ Medgo:"Medgo", Motor:"Motor core", Customer:"Customer master" }[l]);
const allPolicies = () => [...cur.medgo, ...cur.motor];
/* Name from a lookup table, or "<label> <code>" when the table has no entry. */
const named = (group, code, label) => isNull(code) ? NUL : ((window.LOOKUPS[group] || {})[code] !== undefined ? esc(window.LOOKUPS[group][code]) : esc(label + " " + code));
const meta = (l, v) => `<div><span>${l}</span><b>${v}</b></div>`;

/* ----- All attributes: every column of the view, Null when empty ----- */
function attrTable(title, raw, kind) {
  const names = P.cols(kind), nulls = names.filter(c => isNull(raw[c])).length;
  const rows = names.map(c => `<tr class="${isNull(raw[c]) ? "isnull" : ""}"><td class="k">${c}</td><td class="v">${show(raw[c])}</td></tr>`).join("");
  return { html:`<h5>${esc(title)} <small>${names.length} columns, ${nulls} Null</small></h5><table class="kvt"><tbody>${rows}</tbody></table>`, n:names.length, nulls };
}
function attrPanel(label, parts) {
  const t = parts.map(p => attrTable(p[0], p[1], p[2])), n = t.reduce((a, x) => a + x.n, 0), z = t.reduce((a, x) => a + x.nulls, 0);
  return `<details class="all"><summary>${label} <small>${n} columns, ${z} Null</small></summary>
    <label class="hn"><input type="checkbox" data-hn> Hide Null values</label><div class="allbody">${t.map(x => x.html).join("")}</div></details>`;
}

/* ----- Endorsements and payments ----- */
function endorsementList(pol) {
  if (!pol.endorsements.length) return `<div class="empty">No endorsements for this policy. ${NUL}</div>`;
  const motor = pol.line === "Motor", pre = motor ? "end_mot_" : "end_mdg_";
  return `<ul class="tl">` + pol.endorsements.map(e => {
    e.line = pol.line; const r = e.raw, s = P.endStatus(e), cls = tone(s) === "green" ? "" : tone(s);
    const title = motor ? show(r.end_mot_endt_desc) : `${show(r.end_mdg_endt_desc)}: ${show(r.end_mdg_endt_sub_type)}`;
    const line2 = motor ? `${esc(e.key)} · type ${show(r.end_mot_endt_type)}` : `${esc(e.key)} · ${show(r.end_mdg_endt_type)} · via ${show(r.end_mdg_source_code)}`;
    const line3 = motor ? `Entered ${fd(r.end_mot_entry_date)} · updated ${fd(r.end_mot_last_update_date)}`
      : `${isNull(r.end_mdg_ttl_cont) ? "Contribution change " + NUL : (Number(r.end_mdg_ttl_cont) === 0 ? "No contribution change" : (r.end_mdg_ttl_cont > 0 ? "+" : "") + sar(r.end_mdg_ttl_cont, pol.raw.plc_mdg_currency_code))} · approved by ${show(r.end_mdg_approval_user)}`;
    return `<li class="${cls}"><div><b>${title}</b><small>${line2}</small><small>${line3}</small></div><span class="d num">${fd(r[pre + "endt_date"])}</span><span>${pill(s)}</span></li>`;
  }).join("") + `</ul>`;
}
function paymentBlock(pol) {
  const pf = F.payment, cur_ = pol.raw.plcmt_currency_code || pol.raw.plc_mdg_currency_code;
  if (!pol.payments.length) return `<div class="lab">Payments</div><div class="empty">No payment transactions. ${NUL}</div>`;
  let inv = 0, rec = 0;
  const rows = pol.payments.map(t => {
    const r = t.raw, deb = CFG.rules.isDebit(r[pf.isDebit]), amt = Number(r[pf.amount]) || 0;
    deb ? inv += amt : rec += amt;
    return `<tr><td class="num">${esc(t.key)}</td><td>${show(r.arx_trx_type)}: ${show(r.arx_trx_sub_type)}</td><td class="num">${fd(r.arx_trx_date)}</td><td class="r num">${deb ? "" : "-"}${sar(r[pf.amount], cur_)}</td></tr>`;
  }).join(""), due = inv - rec;
  return `<div class="lab">Payments</div><div class="bal">Invoiced ${sar(inv, cur_)}, received ${sar(rec, cur_)}, ${due > 0 ? pill("Outstanding " + sar(due, cur_).replace(/<[^>]+>/g, ""), "red") : pill("Fully paid", "green")}</div>
    <table class="tbl"><thead><tr><th>Transaction</th><th>Description</th><th>Date</th><th class="r">Amount</th></tr></thead><tbody>${rows}</tbody></table>`;
}
function membersBlock(pol) {
  if (!pol.members.length) return `<div class="lab">Members</div><div class="empty">No members linked to this policy. ${NUL}</div>`;
  const rows = pol.members.map(m => { const r = m.raw, id = r.mem_id_no ?? r.mem_iqama_no;
    return `<tr><td><b>${show(r.mem_e_name)}</b><br><span lang="ar">${show(r.mem_a_name)}</span></td><td>${show(r.mem_mem_type)}</td><td class="num">${maskId(id)}</td><td class="num">${fd(r.mem_date_from)}</td>
      <td>${isNull(r.mem_active) ? NUL : pill(CFG.rules.yes.includes(String(r.mem_active).toUpperCase()) ? "Active" : "Inactive")}</td><td>${isNull(r.mem_card_issued) ? NUL : (CFG.rules.yes.includes(String(r.mem_card_issued).toUpperCase()) ? "Issued" : pill("Not issued", "amber"))}</td></tr>`; }).join("");
  return `<div class="lab">Members (${pol.members.length})</div><table class="tbl"><thead><tr><th>Member</th><th>Relation</th><th>ID</th><th>Cover from</th><th>Status</th><th>Card</th></tr></thead><tbody>${rows}</tbody></table>`;
}

/* ----- Policy cards ----- */
function cardShell(pol, icon, iconStyle, title, headMid, metaHtml, body) {
  const st = pol.state, exs = cur.exceptions.filter(e => e.policy === pol.key).length, open = (exs && st.active) || st.unknown;
  const pc = st.unknown ? "amber" : st.active ? "green" : "grey";
  return `<div class="pol ${!st.active && !st.unknown ? "inactive" : ""} ${open ? "open" : ""}" id="pol-${esc(pol.key)}">
    <button class="phead" aria-expanded="${!!open}"><span class="ic" style="${iconStyle}">${icon}</span>
      <span class="pn"><b>${title}</b><small class="num">${esc(pol.key)}</small></span>${headMid}
      <span class="ps">${pill(st.label, pc)}${exs ? pill(exs + (exs > 1 ? " errors" : " error"), "red") : ""}</span>${I.chev}</button>
    <div class="pbody"><div class="meta">${metaHtml}</div>${body}</div></div>`;
}
function motorCard(pol) {
  const r = pol.raw, cu = r.plcmt_currency_code, model = named("model", r.vhc_modelid, "Model code");
  const adj = pol.adjustments.length ? pol.adjustments.map(a => `${show(a.pdsc_transactiontype)} ${sar(a.pdsc_amount, cu)}`).join(", ") : NUL;
  const headMid = `<span class="pm"><span>Vehicle</span><b>${model} ${show(r.vhc_yearofmanufacture)}, ${show(r.pth_platenum)}</b></span>`;
  const m = [
    meta("Issued", fd(r.plcmt_date_iss)), meta("Starts", fd(r[F.motor.from])), meta("Ends", fd(r[F.motor.to])), meta("Product option", named("option", r.plcd_productoptionid, "Option code")),
    meta("Policy status in Motor core", isNull(r.psts_reason) ? named("motorStatus", r.psts_statusid, "Status code") : esc(r.psts_reason)), meta("No claim bonus", isNull(r.plcmt_no_clm_bns_flg) ? NUL : (CFG.rules.yes.includes(String(r.plcmt_no_clm_bns_flg).toUpperCase()) ? "Applied" : "Not applied")),
    meta("Total contribution", sar(r.plcd_totalcontribution, cu)), meta("Basic contribution", sar(r.plcrm_totalbasiccontribution, cu)),
    meta("Loadings and discounts", adj), meta("Renewal contribution", sar(r.plcmt_rnwl_prem, cu)), meta("Policyholder", show(r.plcmt_e_name)), meta("Policyholder (Arabic)", `<span lang="ar">${show(r.plcmt_a_name)}</span>`),
    meta("Vehicle", model), meta("Year", show(r.vhc_yearofmanufacture)), meta("Plate", show(r.pth_platenum)), meta("Chassis number", maskChassis(r.vhc_chassisnum)),
    meta("Colour", named("color", r.vhc_vehiclecolor, "Colour code")), meta("Use", show(r.vhc_vehicleusage)), meta("Seats", show(r.vhc_seatcapacity)), meta("Engine size (cc)", show(r.vhc_cubiccapacity))
  ].join("");
  const body = `<div class="lab">Endorsements (${pol.endorsements.length})</div>${endorsementList(pol)}${paymentBlock(pol)}`
    + attrPanel("All attributes of this policy", [["Policy, vehicle and plate", r, "motor"], ...pol.adjustments.map((a, i) => ["Loading or discount " + (i + 1), a, "adjustment"]),
       ...pol.endorsements.map(e => ["Endorsement " + e.key, e.raw, "motorEnd"]), ...pol.payments.map(t => ["Payment " + t.key, t.raw, "payment"])]);
  return cardShell(pol, I.car, "background:#E4DEFA;color:var(--p-deep)", named("lob", r.plcmt_lob_code, "Cover type"), headMid, m, body);
}
function medgoCard(pol) {
  const r = pol.raw, cu = r.plc_mdg_currency_code, cls = (pol.members.find(x => !isNull(x.raw[F.medgo.planClass])) || { raw:{} }).raw[F.medgo.planClass];
  const headMid = `<span class="pm"><span>Coverage period</span><b class="num">${fd(r.plc_mdg_date_from)} to ${fd(r.plc_mdg_date_to)}</b></span>`;
  const m = [
    meta("Sponsor", show(r.plc_mdg_e_name)), meta("Sponsor (Arabic)", `<span lang="ar">${show(r.plc_mdg_a_name)}</span>`), meta("Issuing branch", named("branch", r.plc_mdg_branch_code, "Branch code")), meta("Plan class", show(cls)),
    meta("Issued", fd(r.plc_mdg_date_iss)), meta("Starts", fd(r.plc_mdg_date_from)), meta("Ends", fd(r.plc_mdg_date_to)), meta("Currency", show(cu)),
    meta("Claims incurred", sar(r.plc_mdg_ttl_claims, cu)), meta("Endorsements on policy", show(r.plc_mdg_ttl_endt))
  ].join("");
  const body = membersBlock(pol) + `<div class="lab">Endorsements (${pol.endorsements.length})</div>${endorsementList(pol)}${paymentBlock(pol)}`
    + attrPanel("All attributes of this policy", [["Medgo policy", r, "medgo"], ...pol.members.map(x => ["Member " + x.key, x.raw, "member"]),
       ...pol.endorsements.map(e => ["Endorsement " + e.key, e.raw, "medgoEnd"]), ...pol.payments.map(t => ["Payment " + t.key, t.raw, "payment"])]);
  return cardShell(pol, I.heart, "background:var(--p-soft);color:var(--p)", isNull(cls) ? "Medical group" : `Class ${esc(cls)} medical group`, headMid, m, body);
}
const bucket = p => p.state.unknown ? "unknown" : p.state.active ? "active" : "inactive";
function group(title, tag, list, build, none) {
  const l = list.filter(p => filter === "all" || bucket(p) === filter);
  return `<div class="pgroup"><div class="grp"><h4>${title}</h4><span class="tag">${tag}</span><span class="cnt2">${l.length} ${l.length === 1 ? "policy" : "policies"}</span></div>
    ${l.length ? l.map(build).join("") : `<div class="nopol">${filter === "all" ? none : "None in this view."}</div>`}</div>`;
}
const policiesHtml = () => group("Medgo policies (Health)", "Medgo", cur.medgo, medgoCard, "No Medgo policies for this customer.") + group("Motor policies", "Motor core", cur.motor, motorCard, "No Motor policies for this customer.");

/* ----- Exceptions ----- */
function exceptionCard(x, i) {
  const icon = x.line === "Customer" ? I.user : x.line === "Motor" ? I.car : I.heart;
  const age = x.age === null || x.age === undefined ? pill("Age Null", "grey") : pill((typeof x.age === "number" ? x.age + "d" : x.age) + " open", "grey");
  return `<div class="ex ${x.sev === "High" ? "high" : "med"} ${i === 0 ? "open" : ""}"><button class="head" aria-expanded="${i === 0}"><span class="ic">${icon}</span>
    <span class="tt"><b>${esc(x.title)}</b><small>${x.id ? esc(x.id) + " · " : ""}${lineName(x.line)} · ${esc(x.ref)}</small></span>
    ${x.status ? pill(x.status) : pill("Status Null", "grey")}${pill(x.sev, x.sev === "High" ? "red" : "amber")}${age}${I.chev}</button>
    <div class="body"><div class="cols"><div><div class="lab">What happened</div><div class="facts">
      <div><span>Source system</span><b>${lineName(x.line)}</b></div><div><span>Status</span><b>${show(x.status)}</b></div><div><span>Reference</span><b class="num">${esc(x.ref)}</b></div>
      ${x.policy ? `<div><span>Policy</span><a data-go="${esc(x.policy)}">${esc(x.policy)}</a></div>` : ""}
      <div><span>How it was detected</span><div class="rule">${esc(x.detected)}</div></div></div></div>
      <div><div class="lab">What to tell the customer</div><div class="scr" lang="ar">${x.ar}</div><div class="scr">${esc(x.en)}</div></div></div></div></div>`;
}

/* ----- Page ----- */
function idrow() {
  const h = cur.header, ini = isNull(h.nameEn) ? "?" : h.nameEn.split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();
  return `<div class="av">${esc(ini)}</div><div><h2>${show(h.nameEn)}</h2><div class="ar" lang="ar">${show(h.nameAr)}</div>
    <div class="chips"><span class="chip copy" data-copy="${esc(h.idNo)}" title="Copy">${esc(h.idType || "ID")} ${esc(h.idNo)}</span>
    ${isNull(h.goldenId) ? '<span class="chip bad">No golden ID</span>' : `<span class="chip copy" data-copy="${esc(h.goldenId)}" title="Copy">Golden ID ${esc(h.goldenId)}</span>`}
    ${h.vip ? '<span class="chip warn">VIP</span>' : ""}${h.blacklist ? '<span class="chip bad">Blacklisted</span>' : ""}
    <span class="chip">Customer since ${isNull(h.since) ? "Null" : new Date(h.since).getFullYear()}</span></div></div>`;
}
function sidebar() {
  const c = cur.customer, h = cur.header;
  return `<aside class="side">
    <div class="card"><h4>Customer</h4><div class="kv">
      <div><span>Customer ID</span><b class="num">${show(h.custId)}</b></div><div><span>Customer type</span><b>${show(c.cli_cust_type)}</b></div>
      <div><span>Nationality</span><b>${named("nationality", c.cli_nationality_code, "Code")}</b></div><div><span>${esc(h.idType || "ID")} expiry</span><b class="num">${fd(h.idExpiry)}</b></div></div></div>
    <div class="card"><h4>Contact</h4><div class="kv"><div><span>Mobile</span><b class="num">${maskMob(c.cli_mobile_no)}</b></div><div><span>Email</span><b>${maskMail(c.cli_email)}</b></div></div></div>
    <div class="card"><h4>Relationships</h4><div class="kv"><div><span>Client group</span><b>${named("group", c.cli_client_group_id, "Group")}</b></div>
      <div><span>Channel</span><b>${show(c.cli_channel_name)}</b></div><div><span>Salesman code</span><b class="num">${show(c.cli_salesman_code)}</b></div></div></div>
  </aside>`;
}
function render() {
  const all = allPolicies(), ex = cur.exceptions, n = b => all.filter(p => bucket(p) === b), cnt = (l, line) => l.filter(p => p.line === line).length;
  const act = n("active"), ina = n("inactive"), unk = n("unknown"), ends = all.reduce((a, p) => a + p.endorsements.length, 0);
  const exSplit = ["Medgo", "Motor", "Customer"].map(l => ex.some(x => x.line === l) ? `${lineName(l).replace(" master", "")} ${ex.filter(x => x.line === l).length}` : "").filter(Boolean).join(", ");
  document.getElementById("idrow").innerHTML = idrow(); document.getElementById("idrow").classList.add("show");
  const filters = [["all", "All " + all.length], ["active", "Active " + act.length], ["inactive", "Inactive " + ina.length]].concat(unk.length ? [["unknown", "Unknown " + unk.length]] : []);
  document.getElementById("results").innerHTML = `
    <div class="stats">
      <div class="stat"><span class="ic pu">${I.shield}</span><div><b>${act.length}</b><span>Active policies</span><span class="sub">Medgo ${cnt(act, "Medgo")}, Motor ${cnt(act, "Motor")}</span></div></div>
      <div class="stat"><span class="ic gr">${I.off}</span><div><b>${ina.length}</b><span>Inactive policies</span><span class="sub">Medgo ${cnt(ina, "Medgo")}, Motor ${cnt(ina, "Motor")}${unk.length ? ", unknown " + unk.length : ""}</span></div></div>
      <div class="stat"><span class="ic dp">${I.doc}</span><div><b>${ends}</b><span>Endorsements</span><span class="sub">Medgo ${cur.medgo.reduce((a, p) => a + p.endorsements.length, 0)}, Motor ${cur.motor.reduce((a, p) => a + p.endorsements.length, 0)}</span></div></div>
      <div class="stat"><span class="ic ${ex.length ? "rd" : "gn"}">${ex.length ? I.alert : I.ok}</span><div><b>${ex.length}</b><span>Active exceptions</span><span class="sub">${exSplit || "None"}</span></div></div>
    </div>
    ${cur.source === "backup" ? `<div class="notice bk"><b>Backup data.</b> The live API did not respond (${esc(String(cur.reason).replace(/\.$/, ""))}). This is the saved sample record, not the customer you searched for.</div>` : ""}
    ${isNull(cur.header.goldenId) ? '<div class="notice">This customer has no golden ID in Informatica MDM. Contact details are not verified, so confirm them with the customer first.</div>' : ""}
    ${unk.length ? '<div class="notice">Some policies have no start or end date in the API, so Active or Inactive cannot be decided. They are marked Unknown.</div>' : ""}
    <div class="grid"><div>
      <section class="sec"><h3 class="sh">Active exceptions ${ex.length ? `<span class="cnt">${ex.length} open</span>` : ""}</h3>
        ${ex.length ? ex.map(exceptionCard).join("") : `<div class="allclear">${I.ok}No active exceptions. Nothing is failing for this customer right now.</div>`}</section>
      <section class="sec"><div class="row-h"><h3 class="sh">Policies and endorsements</h3>
        <div class="filters" role="group" aria-label="Filter policies">${filters.map(f => `<button data-f="${f[0]}" aria-pressed="${filter === f[0]}">${f[1]}</button>`).join("")}</div></div>
        <p class="rnote">Active means today is between the policy start date and end date. Anything else is inactive. If a date is Null the status is Unknown.</p>
        <div id="plist">${policiesHtml()}</div></section>
      <section class="sec">${attrPanel("All customer attributes", [["Customer (cli_)", cur.customer, "customer"]])}</section>
    </div>${sidebar()}</div>`;
  wire();
}
function wire() {
  document.querySelectorAll("[data-copy]").forEach(el => el.onclick = () => { navigator.clipboard && navigator.clipboard.writeText(el.dataset.copy).catch(() => {}); toast("Copied " + el.dataset.copy); });
  document.querySelectorAll(".ex .head, .pol .phead").forEach(b => b.onclick = () => { const p = b.parentElement; p.classList.toggle("open"); b.setAttribute("aria-expanded", p.classList.contains("open")); });
  document.querySelectorAll("[data-hn]").forEach(c => c.onchange = () => c.closest("details").classList.toggle("hidenull", c.checked));
  document.querySelectorAll("[data-go]").forEach(a => a.onclick = () => {
    filter = "all"; document.getElementById("plist").innerHTML = policiesHtml(); syncF(); wire();
    const t = document.getElementById("pol-" + a.dataset.go); if (!t) return; t.classList.add("open", "pulse"); t.scrollIntoView({ behavior:"smooth", block:"center" }); setTimeout(() => t.classList.remove("pulse"), 1400);
  });
  document.querySelectorAll("[data-f]").forEach(b => b.onclick = () => { filter = b.dataset.f; document.getElementById("plist").innerHTML = policiesHtml(); syncF(); wire(); });
}
const syncF = () => document.querySelectorAll("[data-f]").forEach(b => b.setAttribute("aria-pressed", b.dataset.f === filter));

async function search() {
  const v = document.getElementById("q").value.replace(/\D/g, ""), res = document.getElementById("results");
  document.body.classList.remove("landing"); document.getElementById("foot").hidden = false; document.getElementById("idrow").classList.remove("show");
  if (!/^[12]\d{9}$/.test(v)) { res.innerHTML = `<div class="state"><b>A National ID (starts with 1) or Iqama number (starts with 2) has 10 digits.</b>Check the number and try again.</div>`; return; }
  res.innerHTML = '<div style="max-width:720px;padding-top:40px"><div class="skel" style="width:40%"></div><div class="skel"></div><div class="skel" style="width:80%"></div><div class="skel" style="width:55%"></div></div>';
  try {
    const { rows, source, reason } = await window.Agent360Api.fetchRows(v);
    if (!rows.length) { res.innerHTML = `<div class="state"><b>No customer found for ${esc(v)}</b>Check the number and try again.</div>`; return; }
    const store = source === "mock" ? (window.MOCK_EXCEPTIONS || {})[v] : null;   /* exceptions as shown to Rami */
    cur = P.build(rows, store); filter = "all"; cur.source = source; cur.reason = reason;
    if (!store) for (const x of cur.exceptions) x.status = await CFG.exceptionStatus(x);
    render(); window.scrollTo({ top:0 });
  } catch (e) { res.innerHTML = `<div class="state"><b>The customer could not be loaded</b>${esc(e.message)}</div>`; }
}
document.getElementById("form").onsubmit = e => { e.preventDefault(); search(); };
document.getElementById("foot").textContent = CFG.useMock ? "Illustrative screen with dummy data. Names, IDs and figures are invented for layout only, except customer 1070670821, a sample record from the Denodo API. Values missing in the API show as Null." : "Live data from customer_profile_360_view. Values missing in the API show as Null. If the API cannot be reached, a saved sample record is shown.";
