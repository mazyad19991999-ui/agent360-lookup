/* ============================================================================
   Agent 360 configuration. This is the one file to edit when connecting the real API.
   ========================================================================== */
window.AGENT360 = {

  /* 1. DATA SOURCE
     true  = read the local mock rows in data/mock_rows.js (no network).
     false = call the Denodo API described in `api` below. */
  useMock: true,

  /* 2. API CONNECTION (used when useMock is false) */
  api: {
    baseUrl: "",                                   /* TODO: e.g. "https://<denodo-host>:<port>" or your gateway URL */
    path: "/server/<database>/customer_profile_360_view/views/customer_profile_360_view",   /* TODO: confirm with Denodo */
    method: "GET",
    searchParam: "psn_x_infac360in_governmentid",  /* the only search input: National ID or Iqama number */
    extraParams: { "$format": "json" },            /* Denodo RESTful web service format switch, confirm with Denodo */
    headers: {},                                   /* TODO: auth. Do not put passwords in this file, see note below. */
    timeoutMs: 15000
    /* Security note: call the API through a small backend or gateway that holds the credentials.
       Keep user names, passwords and tokens out of browser code. */
  },

  /* 2b. BACKUP. If the API cannot be reached (network error, timeout or an error status), the screen loads the sample record
     from data/backup_sample.js and shows a clear banner. An empty answer from a working API is NOT a failure: it shows "No customer found".
     matchIdOnly: true  = use the backup only when the searched ID is the sample ID (1070670821).
     matchIdOnly: false = use the backup for any search, so the screen still has something to show. */
  backup: { enabled: true, matchIdOnly: false, sampleId: "1070670821" },

  /* 3. RESPONSE PARSING. Denodo normally returns { elements: [ ...rows ] }. The parser also accepts a bare array. */
  responseRowPaths: ["elements", "data", "rows", "items", "result"],

  /* 4. WHICH COLUMN FEEDS EACH OF THE MAIN SCREEN FIELDS.
     If Denodo renames a column, change it here and nothing else. Every other column still appears under "All attributes". */
  fields: {
    searchId:        "psn_x_infac360in_governmentid",
    goldenId:        ["psn_businessid", "cli_mdmid"],        /* first one that is not Null */
    nameEn:          ["psn_fullname", "cli_e_full_name", "cli_e_name"],
    nameAr:          ["psn_x_ar_fullname", "cli_a_full_name", "cli_a_name"],
    custId:          "cli_cust_id",
    vip:             "psn_x_is_vip",
    blacklist:       "cli_blacklist_flag",
    idExpiry:        "cli_id_expiry_date",
    licenceExpiry:   "cli_licence_expiry_date",
    balance:         "cli_balance",
    since:           "cli_insert_date",
    motor: {
      key:     "plcmt_policy_no",
      from:    "plcmt_date_from",     /* PROPOSED: not in the view yet. Active or inactive needs it. */
      to:      "plcmt_date_to",       /* PROPOSED: not in the view yet. */
      endorsementKey: "end_mot_endt_no", endorsementPolicy: "end_mot_policy_no"
    },
    medgo: {
      key:     "plc_mdg_policy_no",
      from:    "plc_mdg_date_from",
      to:      "plc_mdg_date_to",
      quotation: "plc_mdg_quotation_no",
      endorsementKey: "end_mdg_endt_no", endorsementPolicy: "end_mdg_policy_no",
      planClass: "mem_class_no"       /* TO CONFIRM: where the Medgo plan (Class A, B, C) lives */
    },
    member:  { key: "mem_member_code", quotation: "mem_quotation_no" },
    payment: { key: "arx_trx_no", policy: "arx_policy_no", isDebit: "arx_debit", amount: "arx_amount" }
  },

  /* Columns that are proposed for the new API but are not in customer_profile_360_view today.
     They are shown as Null until the API returns them. */
  proposedColumns: ["plcmt_date_from", "plcmt_date_to"],

  /* 5. VALUE RULES that depend on how Tawuniya fills the columns. Confirm these with the Denodo team. */
  rules: {
    yes: ["Y", "YES", "1", "TRUE"],
    isDebit: v => ["Y", "D", "DEBIT", "1", "TRUE"].includes(String(v).toUpperCase()),   /* arx_debit meaning is assumed */
    endorsementStatus: e => {                      /* e = { final, approved } */
      const f = String(e.final || "").toUpperCase(), a = String(e.approved || "").toUpperCase();
      if (f === "Y") return "Completed";
      if (/^(R|REJ)/.test(a)) return "Rejected";   /* assumed: approved holds Rejected, or R */
      if (a === "N") return "Pending approval";
      return "In progress";
    }
  },

  /* 6. EXCEPTIONS. The view has no exception table, so the screen derives them from the columns (see js/profile.js).
     The status (Open, Awaiting customer, ...) needs a store. Plug it in here. Until then the status is Null. */
  exceptionStatus: async (exception) => {
    /* TODO: replace with a call to the case store. Return a string, or null when unknown (the screen then shows Null). */
    return null;
  },

  /* 7. LOOKUPS (code to name). Replace window.LOOKUPS from data/lookups.js with the real tables when they are available. */
};
