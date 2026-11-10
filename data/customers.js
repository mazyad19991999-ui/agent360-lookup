/* Dummy data for the Agent 360 lookup. All names, IDs and figures are invented.
   Sources shown on screen: Informatica MDM (identity, relationships, contact, consent),
   Medgo (Health policies and endorsements), Motor core (Motor policies, endorsements,
   document validation). Exceptions are errors raised on the customer's transactions.
   Search keys: nationalId (starts with 1), iqama (starts with 2), policy number. */
window.CUSTOMERS = [
 {
  goldenId:"GC-208815", name:"Saad Al-Harbi", nameAr:"سعد الحربي", init:"SH", nationalId:"1087654321", iqama:null,
  mobile:"0555104417", email:"saad.alharbi@example.com", lang:"Arabic", consent:"Call and SMS allowed", since:"2019",
  mdm:{ status:"Matched", confidence:99, sync:"11:31", group:"Najd Trading Co.", broker:"Najd Insurance Brokers", household:"Al-Harbi household (4)" },
  policies:[
   { no:"POL-MED-30915", line:"Health", source:"Medgo", product:"Class B Corporate", status:"Active", period:"01 Jan 2026 to 31 Dec 2026", premium:"SAR 14,200", payment:"Paid", insured:"Member MED-91744, 3 dependents",
     end:[["END-HL-2201","Add dependent (newborn)","14 Mar 2026","Completed",""],["END-HL-2288","Update contact details","02 Jun 2026","Completed",""]] },
   { no:"POL-MTR-77120", line:"Motor", source:"Motor core", product:"Comprehensive", status:"Active", period:"15 Mar 2026 to 14 Mar 2027", premium:"SAR 3,460", payment:"Paid", insured:"Toyota Camry 2022, plate ABC 4271",
     end:[["MTR-47102","Add named driver","20 Apr 2026","Completed",""],["MTR-48213","Vehicle replacement (plate 4271)","09 Nov 2026","Rejected","Registration file format not accepted"]] },
   { no:"POL-MTR-61004", line:"Motor", source:"Motor core", product:"Third Party Liability", status:"Inactive", reason:"Expired", period:"15 Mar 2025 to 14 Mar 2026", premium:"SAR 1,150", payment:"Paid", insured:"Honda Accord 2015, plate KLM 2209",
     end:[["MTR-39211","Change of address","11 Aug 2025","Completed",""]] }
  ],
  exceptions:[
   { id:"EX-9021", policy:"POL-MTR-77120", ref:"MTR-48213", system:"Motor core", code:"VAL-DOC-017", reason:"Vehicle registration file rejected, unsupported file format", age:"4h", sev:"High",
     ar:"تعذر قبول ملف تسجيل المركبة بسبب صيغة الملف. نرجو إعادة رفعه بالصيغة المطلوبة، وسنقوم بإصدار الملحق فور ذلك.",
     en:"The vehicle registration upload was not accepted because of its file format. Please re-upload it in the required format and we will issue the endorsement straight away." }
  ]
 },
 {
  goldenId:"GC-310276", name:"Noura Al-Qahtani", nameAr:"نورة القحطاني", init:"NQ", nationalId:"1098765432", iqama:null,
  mobile:"0539876210", email:"noura.q@example.com", lang:"Arabic", consent:"Call allowed, SMS not allowed", since:"2022",
  mdm:{ status:"Matched", confidence:97, sync:"11:31", group:"None (individual)", broker:"Direct", household:"Al-Qahtani household (2)" },
  policies:[
   { no:"POL-MED-41877", line:"Health", source:"Medgo", product:"VIP Individual", status:"Active", period:"10 Feb 2026 to 09 Feb 2027", premium:"SAR 9,800", payment:"Paid", insured:"Member MED-55021, 1 dependent",
     end:[["END-HL-3011","Add dependent","03 Mar 2026","Completed",""],["END-HL-3190","Network upgrade request","05 Nov 2026","In progress","Supporting medical report pending"]] },
   { no:"POL-MED-28830", line:"Health", source:"Medgo", product:"Class B Individual", status:"Inactive", reason:"Expired", period:"10 Feb 2025 to 09 Feb 2026", premium:"SAR 6,900", payment:"Paid", insured:"Member MED-55021",
     end:[["END-HL-2640","Add dependent","18 Apr 2025","Completed",""]] }
  ],
  exceptions:[
   { id:"EX-9102", policy:"POL-MED-41877", ref:"END-HL-3190", system:"Medgo", code:"MDG-DOC-204", reason:"Network upgrade stalled, medical report not received", age:"2d", sev:"Medium",
     ar:"طلب ترقية الشبكة بانتظار التقرير الطبي. نرجو إرساله عبر التطبيق لنتمكن من إكمال الطلب.",
     en:"Your network upgrade request is waiting for the medical report. Please send it through the app so we can complete the request." }
  ]
 },
 {
  goldenId:"GC-455120", name:"Ahmed Hassan", nameAr:"أحمد حسن", init:"AH", nationalId:null, iqama:"2234567890",
  mobile:"0568123344", email:"ahmed.hassan@example.com", lang:"English", consent:"Call and SMS allowed", since:"2021",
  mdm:{ status:"Matched", confidence:96, sync:"11:30", group:"Gulf Logistics Co.", broker:"Al-Rajhi Insurance Brokers", household:"Hassan household (3)" },
  policies:[
   { no:"POL-MED-52210", line:"Health", source:"Medgo", product:"Class C Employer", status:"Active", period:"01 Apr 2026 to 31 Mar 2027", premium:"SAR 5,400", payment:"Paid", insured:"Member MED-70218, 2 dependents",
     end:[["END-HL-4102","Add spouse","12 May 2026","Completed",""],["END-HL-4177","Add child","28 Oct 2026","Rejected","Birth certificate missing"]] },
   { no:"POL-MTR-83390", line:"Motor", source:"Motor core", product:"Comprehensive", status:"Active", period:"22 Jul 2026 to 21 Jul 2027", premium:"SAR 2,980", payment:"Instalment 2 overdue", insured:"Nissan Patrol 2020, plate RDH 7714",
     end:[["MTR-50331","Change vehicle color","04 Aug 2026","Completed",""],["MTR-51044","Add named driver","09 Nov 2026","Rejected","Driver licence not verified"],["MTR-51590","Update plate number","10 Nov 2026","In progress","Awaiting Traffic Department response"]] },
   { no:"POL-MTR-70415", line:"Motor", source:"Motor core", product:"Third Party Liability", status:"Inactive", reason:"Cancelled", period:"05 Jan 2025 to 30 Jun 2025", premium:"SAR 980", payment:"Refunded", insured:"Toyota Yaris 2017, plate JED 3381",
     end:[["MTR-44218","Cancellation with refund","30 Jun 2025","Completed","Refund SAR 410 issued"]] },
   { no:"POL-MED-39901", line:"Health", source:"Medgo", product:"Class C Employer", status:"Inactive", reason:"Expired", period:"01 Apr 2025 to 31 Mar 2026", premium:"SAR 5,100", payment:"Paid", insured:"Member MED-70218, 1 dependent",
     end:[["END-HL-3650","Add spouse","20 Jun 2025","Completed",""]] }
  ],
  exceptions:[
   { id:"EX-9210", policy:"POL-MED-52210", ref:"END-HL-4177", system:"Medgo", code:"MDG-DEP-112", reason:"Child added without birth certificate, endorsement rejected", age:"12d", sev:"High",
     ar:"نحتاج إلى شهادة ميلاد الطفل لإتمام إضافته إلى الوثيقة. نرجو رفعها عبر التطبيق.",
     en:"We need the child's birth certificate to complete adding them to the policy. Please upload it through the app." },
   { id:"EX-9211", policy:"POL-MTR-83390", ref:"MTR-51044", system:"Motor core", code:"VAL-DRV-031", reason:"Driver licence could not be verified for the named driver", age:"1d", sev:"Medium",
     ar:"تعذر التحقق من رخصة القيادة للسائق المضاف. نرجو رفع صورة واضحة من رخصة سارية المفعول.",
     en:"We could not verify the named driver's licence. Please upload a clear photo of a valid licence." },
   { id:"EX-9212", policy:"POL-MTR-83390", ref:"Instalment 2", system:"Motor core", code:"PAY-051", reason:"Premium instalment 2 failed, card declined", age:"3d", sev:"High",
     ar:"تعذر خصم القسط الثاني من البطاقة. نرجو تحديث بيانات الدفع لتجنب إيقاف التغطية.",
     en:"The second premium instalment could not be charged to your card. Please update your payment details to avoid a gap in cover." }
  ]
 },
 {
  goldenId:"GC-120937", name:"Fahad Al-Dosari", nameAr:"فهد الدوسري", init:"FD", nationalId:"1076543210", iqama:null,
  mobile:"0541239876", email:"fahad.d@example.com", lang:"Arabic", consent:"Call and SMS allowed", since:"2017",
  mdm:{ status:"Matched", confidence:99, sync:"11:28", group:"None (individual)", broker:"Direct", household:"Al-Dosari household (5)" },
  policies:[
   { no:"POL-MTR-33018", line:"Motor", source:"Motor core", product:"Comprehensive", status:"Inactive", reason:"Expired", period:"01 Sep 2024 to 31 Aug 2025", premium:"SAR 3,100", payment:"Paid", insured:"GMC Yukon 2019, plate DMM 5520",
     end:[["MTR-30771","Add named driver","15 Nov 2024","Completed",""],["MTR-32005","Change of address","03 Mar 2025","Completed",""]] },
   { no:"POL-MED-19250", line:"Health", source:"Medgo", product:"Class B Employer", status:"Inactive", reason:"Cancelled", period:"01 Jan 2025 to 30 Sep 2025", premium:"SAR 4,700", payment:"Paid", insured:"Member MED-33492, 2 dependents",
     end:[["END-HL-1980","Remove dependent","30 Sep 2025","Completed","Employer ended sponsorship"]] }
  ],
  exceptions:[]
 },
 {
  goldenId:null, name:"Imran Malik", nameAr:"عمران مالك", init:"IM", nationalId:null, iqama:"2345098761",
  mobile:"0592264410", email:null, lang:"English", consent:"Not available (no golden record)", since:"2024",
  mdm:{ status:"Unmatched", confidence:null, sync:"11:31", group:"Not available", broker:"Not available", household:"Not available" },
  policies:[
   { no:"POL-MED-60417", line:"Health", source:"Medgo", product:"Class C Employer", status:"Active", period:"01 Jun 2026 to 31 May 2027", premium:"SAR 4,900", payment:"Paid", insured:"Member MED-84410, 1 dependent",
     end:[["END-HL-5120","Add dependent","03 Nov 2026","In progress","Held until identity is resolved"]] }
  ],
  exceptions:[
   { id:"EX-9301", policy:"POL-MED-60417", ref:"END-HL-5120", system:"Informatica MDM", code:"MDM-MATCH-001", reason:"Medgo member could not be matched to a golden customer ID", age:"7d", sev:"High",
     ar:"لم نتمكن من مطابقة بياناتكم مع سجل العميل لدينا. نرجو تأكيد رقم الإقامة ورقم الجوال لإكمال الطلب.",
     en:"We could not match your details to your customer record. Please confirm your Iqama number and mobile number so we can complete the request." }
  ]
 }
];
