/* Dummy data for the Agent 360 lookup. All names, IDs and figures are invented.
   The shape follows the Insurance_Master_Extract schema:
   - customer      : cli_* (Motor core client table) and cli_mdmid (Informatica MDM golden ID)
   - motorPolicies : plcmt_*, plcrm_*, plcd_*, psts_*, vhc_*, pth_* and end_mot_*
   - medgoPolicies : plc_mdg_* and end_mdg_*
   - exceptions    : derived by rules over the columns above (see the "rule" field)
   Search keys: customer.idNo (National ID starts with 1, Iqama starts with 2) and policy numbers. */
window.CUSTOMERS = [
 {
  custId:"1003356214", mdmId:"MDM000000NF0TS", idType:"National ID", idNo:"1087654321", idExpiry:"2031-04-18",
  nameEn:"Saad Al-Harbi", nameAr:"سعد الحربي", init:"SH", type:"Individual", nationality:"Saudi", since:"2019",
  mobile:"0555104417", email:"saad.alharbi@example.com", vip:false, blacklist:false,
  group:"Najd Trading Co. (G-20418)", channel:"Broker", salesman:"SLM-3302",
  motorPolicies:[
   { no:"POL-MTR-77120", status:"ACTIVE", reason:"", lob:"Comprehensive", option:"Option 214", issued:"2026-03-15", premium:3460, basic:3200, adj:260, ncb:"Y", renewal:3310,
     vehicle:{ model:"Toyota Camry", year:2022, plate:"ABC 4271", chassis:"JTNB11HK6N3••••12", color:"White", usage:"Private", seats:5 },
     endorsements:[
      { no:"MTR-END-0211", date:"2026-04-20", desc:"Add named driver", type:"DRV", final:"Y", approved:"Approved", entered:"2026-04-20", updated:"2026-04-21" },
      { no:"MTR-END-0388", date:"2026-11-09", desc:"Vehicle replacement (plate 4271)", type:"VEH", final:"N", approved:"Rejected", entered:"2026-11-09", updated:"2026-11-09" } ] },
   { no:"POL-MTR-61004", status:"EXPIRED", reason:"Policy term ended", lob:"Third Party Liability", option:"Option 101", issued:"2025-03-15", premium:1150, basic:1150, adj:0, ncb:"N", renewal:1100,
     vehicle:{ model:"Honda Accord", year:2015, plate:"KLM 2209", chassis:"1HGCR2F3XFA••••45", color:"Silver", usage:"Private", seats:5 },
     endorsements:[ { no:"MTR-END-0102", date:"2025-08-11", desc:"Change of address", type:"ADR", final:"Y", approved:"Approved", entered:"2025-08-11", updated:"2025-08-12" } ] }
  ],
  medgoPolicies:[
   { no:"MDG-30915", branch:"Riyadh Main", sponsor:"Najd Trading Co.", sponsorAr:"شركة نجد التجارية", issued:"2025-12-20", from:"2026-01-01", to:"2026-12-31", plan:"Class B", claims:18450, endtTotal:2, currency:"SR",
     endorsements:[
      { no:"MDG-END-2201", date:"2026-03-14", desc:"Member addition", sub:"Newborn dependent", type:"Addition", delta:640, final:"Y", approved:"Approved", approver:"U-4410", source:"Employer portal", cancel:"N" },
      { no:"MDG-END-2288", date:"2026-06-02", desc:"Member data update", sub:"Contact details", type:"Amendment", delta:0, final:"Y", approved:"Approved", approver:"U-4410", source:"Employer portal", cancel:"N" } ] }
  ],
  exceptions:[
   { id:"EX-9021", line:"Motor", policy:"POL-MTR-77120", ref:"MTR-END-0388", title:"Vehicle replacement endorsement rejected", sev:"High", status:"Open", age:"4h",
     rule:"Endorsement approval status is Rejected (end_mot_approved) and not finalised (end_mot_final_flag = N). Reason text comes from the Motor core document validation log.",
     ar:"تعذر قبول ملف تسجيل المركبة بسبب صيغة الملف. نرجو إعادة رفعه بالصيغة المطلوبة، وسنقوم بإصدار الملحق فور ذلك.",
     en:"The vehicle registration upload was not accepted because of its file format. Please re-upload it in the required format and we will issue the endorsement straight away." }
  ]
 },
 {
  custId:"1004471902", mdmId:"MDM000000NF4KQ", idType:"National ID", idNo:"1098765432", idExpiry:"2029-09-02",
  nameEn:"Noura Al-Qahtani", nameAr:"نورة القحطاني", init:"NQ", type:"Individual", nationality:"Saudi", since:"2022",
  mobile:"0539876210", email:"noura.q@example.com", vip:true, blacklist:false,
  group:"None", channel:"Direct", salesman:"None",
  motorPolicies:[],
  medgoPolicies:[
   { no:"MDG-41877", branch:"Jeddah", sponsor:"Noura Al-Qahtani (individual)", sponsorAr:"نورة القحطاني", issued:"2026-02-05", from:"2026-02-10", to:"2027-02-09", plan:"VIP", claims:52300, endtTotal:2, currency:"SR",
     endorsements:[
      { no:"MDG-END-3011", date:"2026-03-03", desc:"Member addition", sub:"Spouse", type:"Addition", delta:2100, final:"Y", approved:"Approved", approver:"U-5120", source:"Mobile app", cancel:"N" },
      { no:"MDG-END-3190", date:"2026-11-05", desc:"Plan change", sub:"Network upgrade", type:"Amendment", delta:1850, final:"N", approved:"Pending", approver:"", source:"Mobile app", cancel:"N" } ] },
   { no:"MDG-28830", branch:"Jeddah", sponsor:"Noura Al-Qahtani (individual)", sponsorAr:"نورة القحطاني", issued:"2025-02-04", from:"2025-02-10", to:"2026-02-09", plan:"Class B", claims:11200, endtTotal:1, currency:"SR",
     endorsements:[ { no:"MDG-END-2640", date:"2025-04-18", desc:"Member addition", sub:"Spouse", type:"Addition", delta:1400, final:"Y", approved:"Approved", approver:"U-5120", source:"Mobile app", cancel:"N" } ] }
  ],
  exceptions:[
   { id:"EX-9102", line:"Medgo", policy:"MDG-41877", ref:"MDG-END-3190", title:"Plan change endorsement not finalised", sev:"Medium", status:"Awaiting customer", age:"2d",
     rule:"Endorsement is not finalised (end_mdg_final_flag = N) and still pending approval (end_mdg_approved) after 2 days.",
     ar:"طلب ترقية الشبكة لم يكتمل بعد. نرجو إرسال المستندات المطلوبة عبر التطبيق لنتمكن من إتمام الطلب.",
     en:"Your network upgrade request is not complete yet. Please send the requested documents through the app so we can finish it." }
  ]
 },
 {
  custId:"1002290815", mdmId:"MDM000000NF2AB", idType:"Iqama", idNo:"2234567890", idExpiry:"2027-02-11",
  nameEn:"Ahmed Hassan", nameAr:"أحمد حسن", init:"AH", type:"Individual", nationality:"Egyptian", since:"2021",
  mobile:"0568123344", email:"ahmed.hassan@example.com", vip:false, blacklist:false,
  group:"Gulf Logistics Co. (G-11875)", channel:"Broker", salesman:"SLM-1180", licenceExpiry:"2026-11-02", balance:745,
  motorPolicies:[
   { no:"POL-MTR-83390", status:"ACTIVE", reason:"", lob:"Comprehensive", option:"Option 214", issued:"2026-07-22", premium:2980, basic:2800, adj:180, ncb:"N", renewal:2900,
     vehicle:{ model:"Nissan Patrol", year:2020, plate:"RDH 7714", chassis:"JN8AY2NE5L9••••83", color:"Black", usage:"Private", seats:7 },
     endorsements:[
      { no:"MTR-END-0291", date:"2026-08-04", desc:"Change vehicle colour", type:"VEH", final:"Y", approved:"Approved", entered:"2026-08-04", updated:"2026-08-04" },
      { no:"MTR-END-0377", date:"2026-11-09", desc:"Add named driver", type:"DRV", final:"N", approved:"Rejected", entered:"2026-11-09", updated:"2026-11-10" },
      { no:"MTR-END-0391", date:"2026-11-10", desc:"Update plate number", type:"VEH", final:"N", approved:"Pending", entered:"2026-11-10", updated:"2026-11-10" } ] },
   { no:"POL-MTR-70415", status:"CANCELLED", reason:"Cancelled by customer", lob:"Third Party Liability", option:"Option 101", issued:"2025-01-05", premium:980, basic:980, adj:0, ncb:"N", renewal:0,
     vehicle:{ model:"Toyota Yaris", year:2017, plate:"JED 3381", chassis:"MR2B29F3XH1••••67", color:"Red", usage:"Private", seats:5 },
     endorsements:[ { no:"MTR-END-0144", date:"2025-06-30", desc:"Policy cancellation", type:"CAN", final:"Y", approved:"Approved", entered:"2025-06-30", updated:"2025-06-30" } ] }
  ],
  medgoPolicies:[
   { no:"MDG-52210", branch:"Dammam", sponsor:"Gulf Logistics Co.", sponsorAr:"شركة الخليج للخدمات اللوجستية", issued:"2026-03-25", from:"2026-04-01", to:"2027-03-31", plan:"Class C", claims:7420, endtTotal:2, currency:"SR",
     endorsements:[
      { no:"MDG-END-4102", date:"2026-05-12", desc:"Member addition", sub:"Spouse", type:"Addition", delta:1500, final:"Y", approved:"Approved", approver:"U-6032", source:"Employer portal", cancel:"N" },
      { no:"MDG-END-4177", date:"2026-10-28", desc:"Member addition", sub:"Child", type:"Addition", delta:900, final:"N", approved:"Rejected", approver:"U-6032", source:"Employer portal", cancel:"N" } ] },
   { no:"MDG-39901", branch:"Dammam", sponsor:"Gulf Logistics Co.", sponsorAr:"شركة الخليج للخدمات اللوجستية", issued:"2025-03-26", from:"2025-04-01", to:"2026-03-31", plan:"Class C", claims:9980, endtTotal:1, currency:"SR",
     endorsements:[ { no:"MDG-END-3650", date:"2025-06-20", desc:"Member addition", sub:"Spouse", type:"Addition", delta:1400, final:"Y", approved:"Approved", approver:"U-6032", source:"Employer portal", cancel:"N" } ] }
  ],
  exceptions:[
   { id:"EX-9210", line:"Medgo", policy:"MDG-52210", ref:"MDG-END-4177", title:"Member addition rejected, not finalised", sev:"High", status:"Open", age:"12d",
     rule:"Endorsement approval status is Rejected (end_mdg_approved) and not finalised (end_mdg_final_flag = N) for 12 days. Reason text comes from the Medgo workflow log.",
     ar:"نحتاج إلى شهادة ميلاد الطفل لإتمام إضافته إلى الوثيقة. نرجو رفعها عبر التطبيق.",
     en:"We need the child's birth certificate to complete adding them to the policy. Please upload it through the app." },
   { id:"EX-9211", line:"Motor", policy:"POL-MTR-83390", ref:"MTR-END-0377", title:"Named driver's licence has expired", sev:"Medium", status:"Awaiting customer", age:"1d",
     rule:"Driver licence expiry date is in the past (cli_licence_expiry_date = 02 Nov 2026) and the add driver endorsement was rejected.",
     ar:"رخصة القيادة للسائق المضاف منتهية. نرجو رفع صورة واضحة من رخصة سارية المفعول.",
     en:"The named driver's licence has expired. Please upload a clear photo of a valid licence." },
   { id:"EX-9212", line:"Customer", policy:"", ref:"Account balance", title:"Outstanding account balance", sev:"High", status:"Open", age:"3d",
     rule:"Client account balance is above zero (cli_balance = SAR 745.00) with installments updated on the policy (end_mot_inst_update_flag).",
     ar:"يوجد رصيد مستحق على حسابكم. نرجو السداد أو تحديث بيانات الدفع لتجنب إيقاف التغطية.",
     en:"There is an outstanding balance on your account. Please pay it or update your payment details to avoid a gap in cover." }
  ]
 },
 {
  custId:"1001184407", mdmId:"MDM000000NE9ZP", idType:"National ID", idNo:"1076543210", idExpiry:"2030-07-21",
  nameEn:"Fahad Al-Dosari", nameAr:"فهد الدوسري", init:"FD", type:"Individual", nationality:"Saudi", since:"2017",
  mobile:"0541239876", email:"fahad.d@example.com", vip:false, blacklist:false,
  group:"None", channel:"Direct", salesman:"None",
  motorPolicies:[
   { no:"POL-MTR-33018", status:"EXPIRED", reason:"Policy term ended", lob:"Comprehensive", option:"Option 214", issued:"2024-09-01", premium:3100, basic:3100, adj:0, ncb:"Y", renewal:0,
     vehicle:{ model:"GMC Yukon", year:2019, plate:"DMM 5520", chassis:"1GKS2CKJ1KR••••09", color:"Grey", usage:"Private", seats:7 },
     endorsements:[
      { no:"MTR-END-0071", date:"2024-11-15", desc:"Add named driver", type:"DRV", final:"Y", approved:"Approved", entered:"2024-11-15", updated:"2024-11-15" },
      { no:"MTR-END-0098", date:"2025-03-03", desc:"Change of address", type:"ADR", final:"Y", approved:"Approved", entered:"2025-03-03", updated:"2025-03-04" } ] }
  ],
  medgoPolicies:[
   { no:"MDG-19250", branch:"Riyadh Main", sponsor:"Al-Wasl Contracting", sponsorAr:"شركة الوصل للمقاولات", issued:"2024-12-22", from:"2025-01-01", to:"2025-12-31", plan:"Class B", claims:6100, endtTotal:1, currency:"SR",
     endorsements:[ { no:"MDG-END-1980", date:"2025-09-30", desc:"Policy cancellation", sub:"Sponsor ended contract", type:"Cancellation", delta:-1200, final:"Y", approved:"Approved", approver:"U-4410", source:"Back office", cancel:"Y" } ] }
  ],
  exceptions:[]
 },
 {
  custId:"1005502716", mdmId:"", idType:"Iqama", idNo:"2345098761", idExpiry:"2026-10-12",
  nameEn:"Imran Malik", nameAr:"عمران مالك", init:"IM", type:"Individual", nationality:"Pakistani", since:"2024",
  mobile:"0592264410", email:"", vip:false, blacklist:false,
  group:"Eastern Steel Works (G-30211)", channel:"Employer", salesman:"None",
  motorPolicies:[],
  medgoPolicies:[
   { no:"MDG-60417", branch:"Dammam", sponsor:"Eastern Steel Works", sponsorAr:"شركة الشرق للصلب", issued:"2026-05-26", from:"2026-06-01", to:"2027-05-31", plan:"Class C", claims:1250, endtTotal:1, currency:"SR",
     endorsements:[ { no:"MDG-END-5120", date:"2026-11-03", desc:"Member addition", sub:"Spouse", type:"Addition", delta:1500, final:"N", approved:"Pending", approver:"", source:"Employer portal", cancel:"N" } ] }
  ],
  exceptions:[
   { id:"EX-9301", line:"Customer", policy:"", ref:"Golden record", title:"Customer not matched to a golden record", sev:"High", status:"Open", age:"7d",
     rule:"The customer has no MDM golden ID (cli_mdmid is empty), so contact details are unverified.",
     ar:"لم نتمكن من مطابقة بياناتكم مع سجل العميل لدينا. نرجو تأكيد رقم الإقامة ورقم الجوال.",
     en:"We could not match your details to your customer record. Please confirm your Iqama number and mobile number." },
   { id:"EX-9302", line:"Customer", policy:"", ref:"Iqama", title:"Iqama has expired", sev:"Medium", status:"Awaiting customer", age:"6w",
     rule:"ID expiry date is in the past (cli_id_expiry_date = 12 Oct 2026).",
     ar:"إقامتكم منتهية. نرجو تحديث بيانات الإقامة عبر التطبيق.",
     en:"Your Iqama has expired. Please update your Iqama details through the app." },
   { id:"EX-9303", line:"Medgo", policy:"MDG-60417", ref:"MDG-END-5120", title:"Member addition not finalised", sev:"Medium", status:"Open", age:"21d",
     rule:"Endorsement is not finalised (end_mdg_final_flag = N) and still pending approval (end_mdg_approved) after 21 days.",
     ar:"طلب إضافة التابع لم يكتمل. سنتابع الطلب مع جهة العمل.",
     en:"The request to add your dependent is not complete. We will follow it up with your employer." }
  ]
 }
];

/* Added from the Denodo view customer_profile_360_view.
   members : mem_* (Medgo members on a policy, linked to the customer by mem_id_no or mem_iqama_no)
   ledger  : arx_* (receivable transactions per policy; arx_debit D = invoice raised, C = payment received)
   Both are attached by policy number so the base records above stay as they were. */
(function () {
  const M = (code, en, ar, type, sex, dob, from, to, active, card, idNo, idExp, nat) =>
    ({ code, nameEn: en, nameAr: ar, type, sex, dob, from, to, active, card, idNo, idExp, nat });
  const T = (no, type, sub, date, dc, amount, fin) => ({ no, type, sub, date, dc, amount, final: fin || "Y" });
  const members = {
    "MDG-30915": [M("30915-01","Saad Al-Harbi","سعد الحربي","Employee","M","1988-05-12","2026-01-01","2026-12-31","Y","Y","1087654321","2031-04-18","Saudi"),
                  M("30915-02","Reem Al-Harbi","ريم الحربي","Spouse","F","1991-02-03","2026-01-01","2026-12-31","Y","Y","1092211876","2030-01-09","Saudi"),
                  M("30915-03","Yazan Al-Harbi","يزن الحربي","Child","M","2026-02-20","2026-03-14","2026-12-31","Y","N","","","Saudi")],
    "MDG-41877": [M("41877-01","Noura Al-Qahtani","نورة القحطاني","Employee","F","1990-09-30","2026-02-01","2027-01-31","Y","Y","1098765432","2029-09-02","Saudi"),
                  M("41877-02","Hessa Al-Qahtani","حصة القحطاني","Parent","F","1962-06-14","2026-02-01","2027-01-31","Y","Y","1011987345","2027-12-01","Saudi")],
    "MDG-52210": [M("52210-01","Ahmed Hassan","أحمد حسن","Employee","M","1984-11-07","2026-04-01","2027-03-31","Y","Y","2234567890","2027-02-11","Egyptian"),
                  M("52210-02","Mona Hassan","منى حسن","Spouse","F","1987-03-19","2026-05-12","2027-03-31","Y","Y","2251190347","2027-01-30","Egyptian")],
    "MDG-60417": [M("60417-01","Imran Malik","عمران مالك","Employee","M","1990-01-25","2026-06-01","2027-05-31","Y","Y","2345098761","2026-10-12","Pakistani")]
  };
  const ledger = {
    "POL-MTR-77120": [T("INV-771201","Invoice","Policy premium","2026-03-15","D",3460), T("RCT-771201","Receipt","Card payment","2026-03-15","C",3460)],
    "POL-MTR-83390": [T("INV-833901","Invoice","Policy premium","2026-07-22","D",2980), T("RCT-833901","Receipt","Card payment","2026-07-22","C",2235),
                      T("INV-833944","Invoice","Endorsement charge","2026-08-04","D",0,"Y")],
    "MDG-30915": [T("INV-309150","Invoice","Policy contribution","2025-12-20","D",92000), T("RCT-309150","Receipt","Bank transfer","2026-01-10","C",92000),
                  T("INV-309188","Invoice","Endorsement, newborn","2026-03-14","D",640), T("RCT-309188","Receipt","Bank transfer","2026-04-02","C",640)],
    "MDG-52210": [T("INV-522100","Invoice","Policy contribution","2026-03-25","D",61500), T("RCT-522100","Receipt","Bank transfer","2026-04-12","C",61500),
                  T("INV-522141","Invoice","Endorsement, spouse","2026-05-12","D",1500), T("RCT-522141","Receipt","Bank transfer","2026-05-30","C",1500)],
    "MDG-41877": [T("INV-418770","Invoice","Policy contribution","2026-01-28","D",18400), T("RCT-418770","Receipt","Bank transfer","2026-02-10","C",18400)],
    "MDG-60417": [T("INV-604170","Invoice","Policy contribution","2026-05-27","D",9800), T("RCT-604170","Receipt","Bank transfer","2026-06-08","C",9800)]
  };
  window.CUSTOMERS.forEach(c => {
    c.medgoPolicies.forEach(p => { p.members = members[p.no] || []; p.ledger = ledger[p.no] || []; });
    c.motorPolicies.forEach(p => { p.ledger = ledger[p.no] || []; });
  });
})();
