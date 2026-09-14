# Portugal Water Atlas

## Start here

Open the map, select a feature and follow its hydrogen assessment link. The main assessment has three plant sliders: electrolyzer capacity, operating factor and electricity intensity. Compare one to four sources side by side and export the evidence.

**Current limitation: no linked source has a fully supported allocatable dry-period budget.** Plant water demand is calculated, but real-source margins and rankings currently show insufficient data. This does not establish site unsuitability. Historical Alqueva evidence is available for inspection; storage and annual system use are not treated as spare supply.

Detailed, explicitly user-supplied scenarios remain at `advanced.html`. The equations, assumptions and verification boundaries are documented in [CAPACITY_METHOD.md](CAPACITY_METHOD.md) and [PUBLIC_BUDGET_METHOD.md](PUBLIC_BUDGET_METHOD.md).

A fresh, standalone map of publicly mapped surface-water features in Portugal:
mainland, Azores and Madeira. Search names or municipalities, filter mapped types,
zoom to features, inspect original OpenStreetMap tags and export a filtered inventory.

## Low-grade-water layer

The **Low-grade water** preset shows separately attributed EEA urban wastewater
treatment-plant points alongside OSM wastewater-tagged areas. **All water layers**
restores the broader atlas. Both layers remain individually toggleable.

The EEA layer is a complete PT country query of the public TreatmentPlants_2022
service, checked against its count endpoint. It contains PT_2022 reported records,
not a current operating census. Plant coordinates and source codes are preserved.
The source's treated-volume and reuse-volume fields are all null for this query.
No population-equivalent capacity is converted to water flow. Available supply is
explicitly **Not established**; no water-quality or treatment-suitability inference
is made. Original EEA records can be opened from each popup.

These are mapped source locations, with no verified reuse-pipeline connections.
No lines are drawn between nearby facilities or water bodies. EEA points and OSM
polygons may describe the same site and are not counted as distinct supplies.
Other low-grade sources (industrial effluent, mine water, stormwater and brackish
groundwater) remain outside the verified layer. Missing regional records do not
mean those facilities or water sources do not exist.

Source: [EEA Waterbase treatment plants](https://www.eea.europa.eu/en/datahub/datahubitem-view/6ffd0af1-64eb-4cce-9970-0028e01ee64e).
The archived query, schema, service description, count response and retrieval
provenance are in data/lowgrade. Keep this source separate from the OSM inventory.
The CSV now includes source-specific links, reporting period, licence and reuse
availability. The OSM database remains ODbL; EEA data retain their own reuse terms.

Rebuild and check the additional layer from the source archive:

```powershell
& ./.venv/Scripts/python.exe build_lowgrade.py
& ./.venv/Scripts/python.exe verify_lowgrade.py
```

The frozen verifier reproduces the published country count and reference plant
coordinates, checks complete source-code coverage, preserves null availability,
and rejects invented network links. fetch_lowgrade.py performs a fresh public
query only when deliberately run; a changed snapshot requires source review.

## Open

In this workspace:

```powershell
& C:/Users/Admin/Desktop/WHEC/.venv/Scripts/python.exe -m http.server 8770 --bind 127.0.0.1 --directory C:/Users/Admin/Desktop/WHEC/portugal_water_atlas/app
```

Open http://127.0.0.1:8770/. A static web server is required; opening index.html
with file:// will not load the data. A modern browser with DecompressionStream
support is required. Search is local. Leaflet is bundled; the contextual basemap
uses standard OpenStreetMap tiles and requires internet. Do not bulk-download
basemap tiles. Water geometry is bundled and remains usable without those tiles.

The Pages ZIP is a self-contained static site. It includes the source archive
and data provenance. Publication is left to the author; no site was pushed.

## Public source

- [HOT Portugal waterways dataset on HDX](https://data.humdata.org/dataset/hotosm_prt_waterways)
- [Catalogue API](https://data.humdata.org/api/3/action/package_show?id=hotosm_prt_waterways)
- [Original GeoJSON ZIP](https://production-raw-data-api.s3.amazonaws.com/ISO3/PRT/waterways/hotosm_prt_waterways_osm_geojson.zip)
- Data: OpenStreetMap contributors, ODbL. See LICENSE_DATA.md.
- Map library: Leaflet, BSD-2-Clause; bundled licence under app/vendor.

The archived catalogue records a dataset interval of 2026-09-08. This is a
snapshot, not live monitoring. The original ZIP and catalogue are retained in
the source package so results do not depend on a moving download URL.

## What the map means

The atlas includes rivers, streams, lakes, reservoirs, ponds, lagoons, wetlands,
canals/drains, coastal/salt-water tags, wastewater-tagged polygons and other
water features. Ancillary mapped features such as dams and weirs are separately
toggleable and hidden by default. A source reservoir tag does not establish size,
ownership or engineering function. Unknown types are kept visibly unknown.

**This is not an exhaustive inventory of every water body.** OpenStreetMap
coverage varies, and small or seasonal water bodies may be missing. A river may
contain many line segments, and polygons and lines may describe the same water.
The counts are feature records, never unique water-body counts. An unnamed feature
is not assigned an invented name. Border waters may extend outside Portugal.

No groundwater inventory, water availability, current water level, water quality,
rights or stress modelling is included. Wastewater polygons are map tags, not
verified reuse supplies. Original tags remain visible in the feature popup.

## Processing

build.py preserves every source feature ID in the search index and geometry
files. Features are grouped into longitude/latitude grid files for loading. The
region is assigned from feature longitude to separate the mainland and island
groups, not as a new legal administrative boundary. Municipality labels come
from the extract. Recognisable Latin-1/UTF-8 mojibake in display names is repaired;
original tags and archive remain unchanged.

Shapes are simplified with topology preservation at 0.00003 degrees and rounded
for display; index bounding boxes derive from original geometry. No calculated
surface area or volume is presented. Features smaller than two screen pixels are
omitted from drawing until zoomed in, but remain searchable and exportable. The
status line discloses small-feature omissions. Selected shapes are highlighted.

## Reproduce and verify

From an extracted source ZIP, with Python, Node.js and requirements installed:

```powershell
python -m venv .venv
& ./.venv/Scripts/python.exe -m pip install -r requirements.txt
& ./.venv/Scripts/python.exe prepare_snapshot.py
& ./.venv/Scripts/python.exe verify.py
& ./.venv/Scripts/python.exe build.py
& ./.venv/Scripts/python.exe verify.py
node --check app/app.js
& ./.venv/Scripts/python.exe -m http.server 8770 --bind 127.0.0.1 --directory app
```

verify.py was written before the map data build. It pins the source checksum,
reproduces the publisher's metadata counts and geometry totals, checks public
landmarks and regional placement, and checks that each original ID appears once
in the built geometry and index. Landmark existence is corroborated by:

- [Alqueva — Visit Portugal](https://www.visitportugal.com/en/content/alqueva)
- [Lagoa Azul at Sete Cidades — Visit Azores visitor guide](https://www.visitazores.com/storage/media/2022/03/feel-alive-en.pdf)
- [Ribeira Brava — Visit Madeira](https://visitmadeira.com/en/where-to-go/madeira/west-coast/ribeira-brava/)

These are regional sanity checks, not independent surveying or completeness
certification. QA.md records browser checks and remaining limits. Updating the
snapshot requires deliberate source review; never change a frozen expected value
just to pass. probe.py is a download/probe helper, not an automatic update service.

## Scope and status

This atlas replaces the previous modelling direction as the active task. The
earlier tool is retained separately. This is a public-data exploration interface;
no novelty, scientific adoption, institutional endorsement or operational decision
support is claimed. No private or HPCL-derived input is included.


## Water-budget and alternative-source comparison
The capacity page now prioritises proposed plant source intake, the net entered dry-period budget, and signed margin or shortfall. Net budget is adjusted gross supply minus existing withdrawals/commitments and protected reserves. Margin subtracts proposed intake; negative net budgets retain pre-existing deficits. Monthly mode uses the minimum margin across entered periods.

Source B is searched from the bundled public geographic records. Each source has independent supply, commitments, reserve, citation, evidence status, supply-retention assumption and purification recovery. Both scenarios share plant size, electricity intensity, operating factor, feed and additional utility intake. A side-by-side table compares them; supplies are never added together. Matching explicit period labels are required for a comparison conclusion. The user must ensure these labels represent the same actual conditions. Geographic duplicates can remain in public records.

A citation entered by the user is not independent verification. Missing budget values remain unknown. Positive margin establishes only a fit to the entered assumptions, not site suitability, water rights, treatment feasibility, conveyance feasibility or ecological safety. No real source flow was added by this feature. The hypothetical example has no geographic attribution and is cleared when selecting real sources.

Run `C:/Users/Admin/Desktop/WHEC/.venv/Scripts/python.exe C:/Users/Admin/Desktop/WHEC/portugal_water_atlas/verify_comparison.py` for the frozen signed-balance and comparison checks. Existing capacity and data checks are retained. JSON exports preserve separate inputs, sources, readiness, evidence, results and comparison status.


Public evidence update: Alqueva now automatically loads verified historical EDIA storage and annual system-use figures, calculates proposed demand, and exports a source-linked evidence receipt. Allocatable dry-period supply remains unresolved; no form water rates are automatically invented. See PUBLIC_BUDGET_METHOD.md. This release does not establish budgets for all Portugal features.


Simplified assessment: capacity.html now exposes only capacity, operating factor and electricity intensity sliders. Optional one-to-four source selection drives a side-by-side table and descending margin ranking. Per explicit user choice, only fully supported exact-source budgets with matching periods qualify; no current linked record establishes such a budget, so current sites correctly show insufficient data and no ranking. Water-intake defaults are visible assumptions. Detailed historical evidence and the prior scenario form remain at advanced.html. The map is unchanged.


Supported-sites filter: assessment search, direct-link selection and comparisons exclude sources without complete supported budgets. The current eligible list is empty; the page says No supported sites available while retaining the plant-demand calculator and geographic atlas. Existing screening checks retain evidence validation and missing-data gates.


User correction: all sources restored. support.html lists every record by budget support and research stage, with searchable filters and full filtered CSV export. No unsupported records removed. First-pass evidence is not an exhaustive site audit. See BUDGET_RESEARCH.md.


2026-09-14 expanded evidence audit: 33 partial-evidence records, including 31 distinct EEA wastewater records audited in this pass, including previously reviewed records; no supported net dry-period budgets. Source hashes, match rationales and missing terms are documented in BUDGET_RESEARCH.md and data/research30/evidence.json. All sites retained. Resume: `C:/Users/Admin/Desktop/WHEC/.venv/Scripts/python.exe C:/Users/Admin/Desktop/WHEC/portugal_water_atlas/verify_research_expansion.py`. Publication verification pending below.
