# Atlas QA

## Hydrogen capacity extension

- Frozen verify_capacity.py reproduces the archived DOE PEM system electricity
  benchmark and checks the actual JavaScript inverse-demand model. See
  VERIFICATION_CAPACITY.txt. Existing geographic verifiers remain unchanged.
- Browser followed an EEA plant popup's Assess hydrogen capacity link. Source
  identity loaded correctly and missing water budgets yielded Not established.
- Hypothetical example visibly removed geographical attribution and produced a
  conditional threshold and proposed-plant comparison.
- Operating-factor change increased average-budget nameplate capacity while the
  full-load equivalent stayed fixed. A drier entered month became limiting.
- Invalid non-consecutive months suppressed results and disabled export. Export
  action was exercised; downloaded file read-back remains outside this QA.
- Chart visually inspected; axis fill corrected. Mobile viewport had no document
  horizontal overflow. Overrides reset. Clearing water inputs restored original
  feature identity and unknown water budget.
- No actual site's ecological stress threshold, source flow, water right or
  treatment suitability has been validated. The illustrative share is not a
  published stress threshold. User-entered numerical ranges do not constitute
  physical validation.

## Low-grade-water extension

- verify_lowgrade.py reproduces the complete public EEA country count and reference
  coordinates, preserves source codes and null treated/reuse/available volumes,
  and checks that no network links are invented. Full output is in
  VERIFICATION_LOWGRADE.txt.
- Browser checked an EEA plant popup, original EEA source link, PT_2022 reporting
  label and the explicit unknown reuse/pipe-connectivity status.
- Plant-only national filter matches the source count; Azores regional filtering
  agrees with the downloaded records. Low-grade and all-water presets work.
- Original Alqueva reservoir search still works. Mobile layout has no document
  horizontal overflow. Source layer is a separate inventory and is not deduplicated
  against the OSM wastewater polygons.
- Actual reusable supply, treatment suitability and physical pipe connectivity
  remain unverified. The UI draws no connecting lines and provides no flow claim.

Checked locally:
- verify.py reproduces original HOT metadata totals and geometry types, pinned
  source checksum, named-landmark identity and regional placement, and full ID
  coverage in the generated search index and geometry. See VERIFICATION.txt.
- Browser loaded real mainland geometry. Searching Alqueva opened the reservoir
  shape with its original OSM relation, name and water tags.
- Azores search opened Lagoa Azul at its actual mapped geometry.
- Madeira ID search opened the Ribeira Brava watercourse with original stream tag.
- Turning off Streams excluded that result and disabled empty-result export.
- Desktop map and popup were visually inspected; mobile document had no horizontal
  overflow. Viewport overrides were reset. Browser error log was empty at inspection.
- OpenStreetMap basemap tiles were observed loaded. They can load after the bundled
  water overlay; a temporarily blank contextual background is not missing water data.
- CSV export action produced an attributed filtered-inventory download notice.
- Small-screen popup placement and close were corrected and retested successfully.
  Selecting a list feature scrolls the map into view on a small screen. Popup
  content scrolls when needed. Reset and the source-date/coverage dialog were exercised.

Limits:
- This is not an independent field survey or complete national inventory.
- Display simplification has geographic sanity checks, not survey-precision validation.
- CSV export content is generated from current filtered records with attribution;
  browser download initiation is checked separately from reading the downloaded file.
- No downloaded file is read from the user's Downloads directory.
- Public deployment, third-party review and adoption are not completed outcomes.


Comparison QA: deterministic signed budget, existing deficit, break-even, missing input, limiting month, recovery and mismatched-period checks passed. Browser exercised hypothetical shortfall versus margin, period mismatch withholding, EEA alternative-source search/selection, clearing invented budgets on returning to real records, and JSON export action. Download contents were not inspected through the browser.


2026-09-14: automatic historical evidence browser QA checked source loading, live demand updates, hypothetical evidence suppression and restoration. Simplified UI checked optional four-site table, alternative EEA selection, capacity slider update, reduction to two sites and export action. Desktop screenshot inspected. Frozen screening tests verify signed margins and ordering using synthetic fixtures only; no real source budget is claimed verified. Mobile layout not rechecked.


Supported-sites filter: assessment search, direct-link selection and comparisons exclude sources without complete supported budgets. The current eligible list is empty; the page says No supported sites available while retaining the plant-demand calculator and geographic atlas. Existing screening checks retain evidence validation and missing-data gates.
