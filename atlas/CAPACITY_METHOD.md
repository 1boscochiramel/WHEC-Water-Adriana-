# Hydrogen capacity at a chosen water-demand threshold

The atlas now links each mapped feature to an assessment at
`capacity.html#id=<source-id>`. Source identity resolves from the bundled geographic
data. Source geometry does not establish flow: no site receives a pre-filled
hydrological budget or an automatic capacity rating.

## Interpretation

The question answered is: **At what nameplate electrical capacity does average
source-water intake reach my chosen share of the remaining water budget?**

This is a conditional screening calculation. There is no universal fraction at
which ecological harm starts. The illustrative share is a user assumption, not
a published stress indicator, legal rule, entitlement or safe operating limit.
Any additional abstraction may affect a source. Environmental relevance requires
evidence and expert review for the chosen place and period.

## Inputs and units

- Gross source supply S: m3/day, representative of a critical dry period, or a
  monthly series of average daily rates. Do not enter monthly totals here.
- Existing withdrawals/commitments C and additional protected reserve E: m3/day.
  Account for downstream and ecosystem requirements without double counting.
- Supply-retention fraction d: sensitivity assumption applied only to S.
- Screening share a: fraction of the remainder assigned to this scenario.
- Electricity intensity e: kWh/kg H2 at the system boundary.
- Operating factor f: equivalent full-load hours divided by elapsed hours.
- Purified feedwater w: L/kg H2; purification recovery r: product/intake fraction.
- Additional cooling/utility intake c: L/kg H2 at the source boundary.
- Test plant size P: MW electrical nameplate capacity.

Missing source water inputs remain unknown. All entered budgets are user-supplied
and unverified by the software. The flow citation and identification of assumptions
are required before producing a capacity result. A map source link is not flow
evidence. Input bounds reject malformed/negative values but do not validate plant
performance or hydrological suitability.

## Equations

```
I = w / r + c                         [L source intake / kg H2]
q = 24 * f * I / e                    [m3/day per MW]
H2(P) = 1000 * 24 * f * P / e         [kg H2/day]
R = max(0, d*S - C - E)               [m3/day remaining]
B = a * R                            [m3/day screening budget]
P_threshold = B / q                   [MW nameplate]
```

The factors converting MW to kW and litres to cubic metres cancel in q. The
full-load continuous-equivalent threshold repeats the calculation with f=1.
A lower operating factor can increase allowable nameplate under an average-rate
budget while still exceeding the source's instantaneous withdrawal capacity when
running. Neither sub-daily scheduling nor water buffers are modelled. The second
capacity is also a daily-rate comparison, not an instantaneous ecological limit.

For a monthly series the smallest threshold among entered months governs. Operating
factor and water intensities are held constant across months. Missing months within
the entered series, duplicate months and invalid values are rejected. A short
consecutive series is allowed, but cannot establish year-round reliability. Existing
commitments exceeding adjusted supply produce zero headroom and an explicit warning.

Source intake is used; no credit is given for cooling return flows or purification
reject. This is not net consumption. Wastewater diversion may reduce downstream
flows even when described as reuse: include that dependence in C or E as appropriate.
No storage, aquifer depletion, water-quality, treatment-design or permitting model
is included. Ocean, estuary, wetland and infrastructure features require a separately
justified source budget before this calculation has a meaningful interpretation.

## Public engineering anchor and verification

The default electricity intensity reproduces the **2022 PEM system** benchmark in
the [DOE technical-target table](https://www.energy.gov/cmei/fuels/technical-targets-proton-exchange-membrane-electrolysis).
It is a historical reference, not a claim about the efficiency of a proposed plant.
The archived HTML is in data/capacity/doe_pem.html. Feedwater, purification recovery,
cooling and operating factor are editable assumptions, not measured site values.

verify_capacity.py was frozen before the model. It extracts the published system
benchmark from the original table and exercises inverse-capacity arithmetic,
recovery/cooling effects, operating-factor distinction, dry-supply sensitivity,
the limiting period, zero headroom, missing-data abstention and invalid inputs.
These checks establish arithmetic and provenance; they do not establish physical
or ecological validation. The earlier atlas verifiers remain unchanged.

```powershell
& ./.venv/Scripts/python.exe verify_capacity.py
```

The hypothetical example clears geographic attribution and exports `source: null`.
Its inputs are invented solely to demonstrate the calculation. Clear water inputs
to restore the selected feature and its unknown hydrological state. Editing any
input invalidates the displayed result until Calculate is pressed. Exports retain
inputs, source identity, evidence status, results and limitations.


## Water-budget and alternative-source comparison
The capacity page now prioritises proposed plant source intake, the net entered dry-period budget, and signed margin or shortfall. Net budget is adjusted gross supply minus existing withdrawals/commitments and protected reserves. Margin subtracts proposed intake; negative net budgets retain pre-existing deficits. Monthly mode uses the minimum margin across entered periods.

Source B is searched from the bundled public geographic records. Each source has independent supply, commitments, reserve, citation, evidence status, supply-retention assumption and purification recovery. Both scenarios share plant size, electricity intensity, operating factor, feed and additional utility intake. A side-by-side table compares them; supplies are never added together. Matching explicit period labels are required for a comparison conclusion. The user must ensure these labels represent the same actual conditions. Geographic duplicates can remain in public records.

A citation entered by the user is not independent verification. Missing budget values remain unknown. Positive margin establishes only a fit to the entered assumptions, not site suitability, water rights, treatment feasibility, conveyance feasibility or ecological safety. No real source flow was added by this feature. The hypothetical example has no geographic attribution and is cleared when selecting real sources.

Run `C:/Users/Admin/Desktop/WHEC/.venv/Scripts/python.exe C:/Users/Admin/Desktop/WHEC/portugal_water_atlas/verify_comparison.py` for the frozen signed-balance and comparison checks. Existing capacity and data checks are retained. JSON exports preserve separate inputs, sources, readiness, evidence, results and comparison status.


Public evidence update: Alqueva now automatically loads verified historical EDIA storage and annual system-use figures, calculates proposed demand, and exports a source-linked evidence receipt. Allocatable dry-period supply remains unresolved; no form water rates are automatically invented. See PUBLIC_BUDGET_METHOD.md. This release does not establish budgets for all Portugal features.


Simplified assessment: capacity.html now exposes only capacity, operating factor and electricity intensity sliders. Optional one-to-four source selection drives a side-by-side table and descending margin ranking. Per explicit user choice, only fully supported exact-source budgets with matching periods qualify; no current linked record establishes such a budget, so current sites correctly show insufficient data and no ranking. Water-intake defaults are visible assumptions. Detailed historical evidence and the prior scenario form remain at advanced.html. The map is unchanged.
