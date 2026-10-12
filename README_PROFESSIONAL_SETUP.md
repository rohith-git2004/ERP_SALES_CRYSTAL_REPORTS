# Professional setup

The current authoritative setup instructions are in [`README.md`](README.md).

The project structure has been updated to remove the separate Angular print/report applications. Maintain report designs as `.rpt` files under `crystal-reports/`; the generic Express report API discovers those files without adding a route for each report.

The Crystal rendering bridge and Angular-to-SQL persistence migration are not complete. See `PROJECT_STATUS.md` and `crystal-reports/CRYSTAL_INTEGRATION.md` for the exact current boundaries.
