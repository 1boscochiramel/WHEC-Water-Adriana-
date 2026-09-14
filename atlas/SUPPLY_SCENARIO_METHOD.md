# Automatic supply calculation: current scope

Research-review release 0.2.0-review, 15 September 2026. The intended product is an automatic, public-data-backed available-water estimate driven by electrolyser capacity, operating factor and electricity intensity. The complete dry-period estimate has not been established.

## Implemented calculation

For exact mapped wastewater records with explicit 2024 treated-water data and reported water+ production on the same archived operator page:

`annual residual scenario (m3/day) = (treated volume - reported reuse production) / 366`

`conditional difference = annual residual scenario - plant source-water intake`

`required residual share (%) = 100 * plant source-water intake / annual residual scenario`

The result is a conditional historical annual balance. It is not measured surplus, a confidence bound, permitted supply, or a dependable dry-period budget. Reuse production is not proof of consumption. The deduction assumes it is a separate, fully used share of the treated output; internal recirculation and meter boundaries could invalidate that assumption. Environmental obligations and other allocations have not been deducted. Annual averaging assumes uniform operation and cannot establish summer or instantaneous feasibility.

The existing demand model includes assumed purification recovery. The residual is at the source boundary, so purification is not deducted twice. Cooling remains excluded as stated in the interface. A positive annual difference does not establish feasibility; a negative difference refers only to the historical annual scenario.

The main supported-budget table and ranking retain their original evidence gate. No supported budget or dry-period allowance was populated. The separate annual comparison displays the scenario label with the numbers and exports its assumptions and missing terms. Design capacities and records without an explicit matching reporting year are not converted into scenario supply.

## Required next work

1. Obtain exact-source monthly/daily flow records and reconcile their meter boundaries with reuse measurements.
2. Establish current reuse deliveries and contractual commitments for the same period.
3. Establish protected discharge and downstream dependence. Discharge is not automatically unused water.
4. Validate a low-flow model against held-out observed records before transferring it to missing-data sites. Municipal totals cannot silently substitute for a plant.
5. Establish treatment quality, delivery capability and intended-use permissions.

No uniform spare-water percentage, drought factor, or model confidence interval has been invented. If these terms remain unavailable, the full requested estimate remains unresolved.

## Reproduce

Run `build_flow_estimates.py`, `verify_flow_estimates.py`, `build_supply_scenarios.py`, then `verify_supply_scenario.py` using the workspace virtual environment. The verifier was written before the builder and independently anchors Rio Maior, Torres Vedras and Zambujeira annual values to archived primary pages. Source hashes, exact anchors and original URLs are included in `app/data/supply_scenarios.json`.

The local assessment is `app/capacity.html`. The original atlas and source selector are preserved. Publication status is recorded separately in PUBLISH_REVIEW.json after deployment verification.
