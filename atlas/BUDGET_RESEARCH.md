# Water-budget research register

All mapped records remain selectable and listed. User correction supersedes the previous supported-only filter. No deletions are planned before research and review.

## First pass, 2026-09-14
The register classifies every source ID from the geographic and treatment-plant inventories. Geographic objects are not unique water bodies; OSM geometry and EEA plant locations can overlap. A not-supported classification means no established budget in this release, never no water or an unsuitable site.

- Supported: source-specific, period-specific net allowance supported by reviewed public evidence. No current entry qualifies.
- Partial evidence: an individual source or operator page was reviewed, but the balance remains incomplete.
- Catalogue only: EEA inventory checked; flow fields absent; a site-specific operator search has not been completed.
- Not site reviewed: geographic feature retained; no individual evidence search completed.

## Reviewed leads
Afonsoeiro: SIMARSUL operator page describes design flow and discharge to the Tejo basin. It does not establish spare daily reuse supply. Web reading succeeded; direct machine download failed certificate validation. No certificate protections were bypassed.
Almargem: operator page documents treatment capacity, receiving water and internal reuse treatment. Need dry-period operating flows, existing reuse and discharge constraints.
Vilamoura: operator announcement describes reuse infrastructure intended for golf/green-space use, jointly with Quinta do Lago. Need operating records and commitments at the individual plant.
Quinta do Lago: operator reports inaugurated reuse infrastructure and existing delivery points, with estimated annual production. Need actual monthly production, commitments and net available allowance.
Alqueva: archived EDIA annual report supports monthly storage and annual EFMA use. Need a matched-period hydrological and allocation balance. Storage is not flow and annual system use is not local spare supply.

Exact citations and next steps are stored in app/data/budget_review.json and shown in support.html. Operator-name matches are research leads, not verified physical supply connections. New numerical source values have not been imported into the capacity model. All new findings here are qualitative; the geographic-ID coverage and null-budget classification are checked by verify_support_register.py.

## Next research work
Prioritise the selected Afonsoeiro source and the named wastewater reuse plants: search operator annual/environmental reports and publicly accessible reuse-production permits for actual monthly production, committed deliveries, retained discharge and an explicit allocatable amount. If only design capacity or annual potential is found, retain partial-evidence status. For other records, first resolve whether they represent a distinct abstractable source before spending effort on hydrology. A complete supported budget cannot be guaranteed for every map object.

The first pass is not an exhaustive search. No unattended/background search is implied by this register. Remove unsupported sources only after a later explicit review decision.
