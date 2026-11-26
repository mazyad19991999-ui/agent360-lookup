# Schema mapping for Agent 360

| Area | Medgo | Motor | Status |
|---|---|---|---|
| Active / inactive policies | plc_mdg_* (dates, plan, sponsor, branch, claims), end_mdg_policy_cancel | plcrm_*, plcd_*, psts_*, pdsc_*, vhc_*, vhcp_* | Have. Medgo state from end date plus cancel flag. Motor state from status id (no start or end date columns). |
| Endorsements | end_mdg_* (type, final flag, approved, approver, source, delta) | end_mot_* (type, final flag, approved, entered, updated) | Have. Status derived: Rejected if approved is Rejected, Completed if final flag is Y, else In progress. |
| Active exceptions | Derived by rules over end_mdg_* | Derived by rules over end_mot_*, licence expiry, balance | Partial. Detection rules possible, rejection reasons and exception status need a case store. |
| Customer | cli_*, cli_mdmid, psn_* | same | Have. No golden ID when cli_mdmid is empty. |

## Gaps to ask Tawuniya for
- Medgo member table linking national ID or Iqama to policy
- Motor policy start and end dates
- Rejection reason and error log tables, plus a case or status store for exceptions
- Medgo endorsement entry timestamps
- Lookups: motor model code, product option, psts status codes
- Payment and instalment data
- plc_mdg_i column is truncated in the extract

## Do not surface
IBAN, income, PEP flags and similar sensitive columns.
