# Automatic public water evidence — coverage and calculation

The selected Alqueva feature is linked by an exact curated source ID to EDIA's official Report and Accounts 2024, page 20, Table 11 (EFMA annual use) and Table 13 (Alqueva monthly stored/useful volumes). This is a historical snapshot, not live data. The public PDF was downloaded directly and its table layout visually checked. `build_public_budget.py` extracts the table values and preserves provenance. `verify_public_budget.py` pins the original PDF and checks published anchors, the annual component sum, calendar arithmetic and missing-budget abstention.

Automatically calculated: proposed daily plant intake from the shared engineering model, monthly and annual demand using actual calendar lengths, demand as a fraction of reported annual EFMA use, and the change between reported end-January and end-December reservoir stocks. These are contextual calculations, not measures of spare supply or ecosystem damage. The annual-use denominator covers the EFMA system; monthly storage covers the named reservoir. They are not combined into a water balance.

**The requested automatic allocatable dry-period budget remains unresolved.** Neither monthly storage nor annual delivered use establishes the renewable dry-period supply, monthly commitments, required ecological releases, protected storage and allowable drawdown. The app leaves these null; it does not fill scenario inputs from incompatible quantities. A stock divided by days is not a sustainable daily budget. Geographic records without a curated flow link get no inferred water value.

Sources inspected:
- [Official EDIA report](https://www.edia.pt/wp-content/uploads/2026/02/RelatorioContas_2024_EN.pdf#page=20): linked numerical evidence.
- [Annual water-use plan, April 2024 revision](https://www.edia.pt/wp-content/uploads/2024/05/PAUA_2024_abr2024.pdf): annual planning scope, not a complete monthly hydrological balance. Annex II contains inconsistent year labeling; not imported as monthly commitments.
- [EDIA sustainability report 2024](https://www.edia.pt/wp-content/uploads/2025/05/RelatorioSustentabilidade_EDIA_2024_compressed.pdf): pages 19–20 explain environmental-flow conditions; a monthly obligation is not inferred from an individual release event.

The browser export contains the original URL, page/table, checksum, extraction values, engineering inputs, calculated quantities and null availability/margin fields. Raw official PDFs stay in the local research evidence directory and are not redistributed in the release archives. To reproduce from a source archive, run `fetch_public_budget.py`, `build_public_budget.py`, then `verify_public_budget.py` with Python and the project dependencies. A changed publisher PDF fails the hash gate and requires review.

Known gap G-PUBLIC-BUDGET: missing matched-period allocation terms. Establishing these requires further public-data evidence or publicly releasable source-authority confirmation. No company-specific adverse conclusion is drawn.
