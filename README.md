# ERP_SALES_CRYSTAL

ERP Sales project structure for the existing Angular ERP UI, Node.js/Express API, SQL Server, and independently maintained Crystal Reports `.rpt` templates.

## Structure

```text
ERP_SALES_CRYSTAL/
├── ERP-sales-frontend/          # Existing Angular ERP UI; preserved
├── backend/                     # Node.js + Express REST API
│   ├── src/
│   │   ├── routes/orders.js     # Sales order API
│   │   ├── routes/reports.js    # Generic report listing/PDF endpoint
│   │   ├── services/crystalReports.js
│   │   ├── db.js
│   │   └── server.js
│   ├── sql/001_create_sales_orders.sql
│   └── .env.example
├── crystal-reports/             # Put .rpt files here; no report Angular apps
│   ├── sales-order/
│   ├── sales-reports/
│   ├── customer-ledger/
│   └── inventory/
├── database/                    # SQL Server diagnostic scripts
├── docs/
├── .gitignore
├── PROJECT_STATUS.md
└── README.md
```

The former `ERP_SALES_ORDER_PRINT_ANGULAR` and `ERP_SALES_ORDER_REPORTS_ANGULAR` projects have been removed from this updated package's intended structure. Their report responsibilities belong in `crystal-reports/` once the corresponding `.rpt` designs are created and tested.

## Requirements

- Node.js 20+ (Node 24 is also suitable for the API code)
- SQL Server and SSMS
- A compatible and licensed SAP Crystal Reports runtime plus a Windows-side bridge/service. This bridge is separate from Node.js and is not included as a compiled binary in this source package.

## Install (Windows CMD)

From the project root:

```cmd
cd backend
npm install
copy .env.example .env
notepad .env
npm run check
```

Fill in `DB_SERVER`, `DB_PORT`, `DB_DATABASE`, `DB_USER`, and `DB_PASSWORD`. Configure `CRYSTAL_RENDERER_URL` only after a compatible Windows Crystal renderer has been installed and tested. Keep `.env` private.

Start the API:

```cmd
npm start
```

The API defaults to `http://localhost:3000`.

## SQL Server schema

`backend/sql/001_create_sales_orders.sql` is a starter schema for `dbo.SalesOrders`, not a migration of your existing production database. Review the script, verify the target database, and take a backup before running it in SSMS. The current schema may need mapping to your real ERP tables.

## API quick checks

- `GET http://localhost:3000/api/health` — API/database status
- `GET http://localhost:3000/api/orders` — sales orders
- `GET http://localhost:3000/api/reports` — dynamically discovered `.rpt` files
- `POST http://localhost:3000/api/reports/sales-order/SalesOrder/pdf` with `Content-Type: application/json` and body `{"parameters":{"OrderId":"SO-10001"}}` — returns PDF only after the Crystal bridge is configured and a matching `.rpt` exists.

## Adding a report

1. Create the report design in Crystal Reports.
2. Save the `.rpt` under a category in `crystal-reports/`.
3. The generic API discovers the new file under `GET /api/reports`; no per-report Angular folder or Express route is required.
4. If the report needs new data/parameters, configure that data in the bridge/backend too. Layout-only changes to an existing report do not require main Angular code changes.

## Current implementation boundaries

- Existing Angular ERP source/UI is preserved.
- Express order endpoints and SQL Server connection foundation are included.
- Generic report discovery and a PDF-forwarding endpoint are implemented.
- The actual Crystal runtime bridge is **not included or tested** because it depends on the installed Crystal version, runtime/bitness, license, and `.rpt` compatibility.
- The existing Angular order store still uses `localStorage`; the full frontend-to-SQL migration and end-to-end integration are not complete in this package.
- No real `.rpt` templates were supplied, so the report folders start empty.

Do not treat this archive as a fully production-ready SQL/Crystal conversion until the database mapping, Crystal bridge, and end-to-end tests are completed.

## Update note (2026-10-11)
- Removed browser `localStorage`/`sessionStorage` usage from Angular order storage.
- Order data is loaded from the backend `GET /api/orders` endpoint; order saves use `POST /api/orders`, authorization uses `PATCH /api/orders/:id/authorize`, and deletion uses `DELETE /api/orders/:id`.
- Backend JavaScript syntax check (`npm run check`) passed in this workspace. This does not verify an Angular production build, SQL Server connectivity on another machine, or Crystal Reports rendering.
