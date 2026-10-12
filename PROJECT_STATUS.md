# Project status

## Included in this package
- Existing `ERP-sales-frontend` Angular ERP UI preserved.
- Removed the separate Angular print/report projects from this package's intended final structure.
- Node.js/Express API foundation and SQL Server connection using `mssql`.
- Starter `dbo.SalesOrders` SQL schema.
- Generic Crystal report discovery under `crystal-reports/`.
- `GET /api/reports` and a PDF-forwarding endpoint that calls the configured renderer bridge.
- Root and backend `.gitignore` files, `.env.example`, README and Crystal bridge documentation.

## Still required before production
- Frontend order persistence is still based on `localStorage`; Angular-to-API migration has not been completed.
- The starter schema must be mapped to the user's actual SQL Server database.
- A compatible, licensed Windows Crystal Reports runtime and bridge must be implemented/configured and tested.
- Actual `.rpt` files were not supplied; report directories are placeholders.
- End-to-end tests for save, draft, edit, authorize, list, report and print have not been completed.

The report API deliberately returns a clear configuration error when no Crystal renderer is configured. Do not assume that copying `.rpt` files alone enables PDF rendering.
