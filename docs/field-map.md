# Denodo view customer_profile_360_view: field map

Search inputs of the view
| Screen search | View input parameter |
|---|---|
| National ID / Iqama number | psn_x_infac360in_governmentid |
| Policy number | plcmt_policy_no |

Screen to view columns
| Screen area | Columns |
|---|---|
| Customer header and sidebar | cli_cust_id, cli_mdmid, cli_e_name, cli_a_name, psn_x_is_vip, cli_blacklist_flag, cli_cust_type, cli_nationality_code, cli_id_expiry_date, cli_mobile_no, cli_email, cli_client_group_id, cli_channel_name, cli_salesman_code |
| Motor policy | plcmt_policy_no, plcmt_lob_code, plcmt_date_iss, plcmt_rnwl_prem, plcmt_no_clm_bns_flg, plcd_productoptionid, plcd_totalcontribution, plcrm_totalbasiccontribution, pdsc_amount, psts_statusid, psts_reason |
| Motor vehicle | vhc_modelid, vhc_yearofmanufacture, vhc_chassisnum, vhc_vehiclecolor, vhc_vehicleusage, vhc_seatcapacity, pth_platenum |
| Motor endorsements | end_mot_endt_no, end_mot_endt_date, end_mot_endt_desc, end_mot_endt_type, end_mot_final_flag, end_mot_approved, end_mot_entry_date, end_mot_last_update_date |
| Medgo policy | plc_mdg_policy_no, plc_mdg_e_name, plc_mdg_a_name, plc_mdg_branch_code, plc_mdg_date_iss, plc_mdg_date_from, plc_mdg_date_to, plc_mdg_ttl_claims, plc_mdg_ttl_endt, plc_mdg_currency_code |
| Medgo members | mem_member_code, mem_e_name, mem_a_name, mem_mem_type, mem_id_no, mem_iqama_no, mem_date_from, mem_active, mem_card_issued |
| Medgo endorsements | end_mdg_endt_no, end_mdg_endt_date, end_mdg_endt_desc, end_mdg_endt_sub_type, end_mdg_endt_type, end_mdg_ttl_cont, end_mdg_final_flag, end_mdg_approved, end_mdg_approval_user, end_mdg_source_code, end_mdg_policy_cancel |
| Payments | arx_trx_no, arx_trx_type, arx_trx_sub_type, arx_trx_date, arx_debit, arx_amount, arx_policy_no |

Points to confirm with the Denodo team
* The only policy input is plcmt_policy_no (Motor prefix). Confirm it also matches Medgo numbers, or ask for plc_mdg_policy_no as a second input.
* The view is flat, so one customer returns many rows (vehicle x endorsement x member x transaction). The screen groups rows by policy number, so confirm the keys: plcmt_policy_no, plc_mdg_policy_no, end_*_endt_no, mem_member_code, arx_trx_no.
* Motor still has no start or end date columns, so active or inactive comes from psts_statusid.
* Exception status and rejection reasons are still not in the view.
* Keep these off the screen: cli_iban, cli_viban, cli_monthly_income, cli_pl_annual_income, cli_pep_* and similar.
