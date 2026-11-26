# Connecting the real API

Everything that touches the API is in two files. The screen itself never changes.

1. js/config.js: set useMock to false, then fill api.baseUrl, api.path and api.headers. The search parameter is psn_x_infac360in_governmentid.
2. js/api.js: fetchRows(idNo) builds the request and reads the rows. It accepts { elements: [...] } or a bare array, turns "<null>" and missing columns into Null, and returns the flat rows.

How the rows become the screen (js/profile.js)
* The view repeats a customer on many rows, so rows are grouped by key: plcmt_policy_no, plc_mdg_policy_no, end_mot_endt_no, end_mdg_endt_no, mem_member_code and arx_trx_no.
* Members link to a Medgo policy through the quotation number (mem_quotation_no and plc_mdg_quotation_no). Payments link through arx_policy_no.
* All 432 columns are kept. Each policy and the customer have an "All attributes" panel that lists every column, with Null where the API has no value.
* Active or inactive: today between start and end date. Motor start and end columns are not in the view yet, so config.js uses the placeholder names plcmt_date_from and plcmt_date_to. Until they exist the status shows Unknown.
* Exceptions are derived from the columns. Their status needs a case store: plug it into exceptionStatus in config.js.

Assumed, please confirm with the Denodo team
* end_mot_approved and end_mdg_approved values (config.js, rules.endorsementStatus)
* arx_debit meaning (config.js, rules.isDebit)
* Plan class comes from mem_class_no
* Golden ID is psn_businessid, because cli_mdmid is Null in the sample record
* Lookup tables for model, colour, branch, option, nationality, lob (data/lookups.js is mock)

Security: call the API through a backend or gateway that holds the credentials. Do not put passwords or tokens in browser code.

Backup sample
If the API cannot be reached (network error, timeout or an error status), the screen loads data/backup_sample.js, the real sample record from Denodo, and shows a red Backup data banner. Set backup.enabled to false in js/config.js to turn it off, or matchIdOnly to true to use it only when the searched ID is 1070670821. An empty answer from a working API shows "No customer found" and does not trigger the backup.
