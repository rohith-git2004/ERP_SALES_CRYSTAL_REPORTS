# Start here

Use the root `README.md` for the current project structure and Windows CMD setup commands.

The intended structure keeps the existing Angular ERP UI, uses Node.js/Express for API requests and SQL Server access, and stores Crystal `.rpt` templates under `crystal-reports/`. The former separate Angular print/report projects are not included in this updated package.

Important current boundaries:
- The existing Angular order store still uses `localStorage`; migration to the SQL-backed API is not complete.
- The API has dynamic `.rpt` discovery and a PDF-forwarding endpoint, but actual rendering requires a compatible Crystal Reports Windows bridge that is not included here.
- No real `.rpt` files or SQL Server database backup/schema were present in the supplied source.

Do not treat this package as a finished production deployment until the actual SQL schema is mapped and the Crystal bridge and end-to-end workflows are tested.
