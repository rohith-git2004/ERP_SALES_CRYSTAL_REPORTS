# Setup notes

See the root `README.md` for Windows CMD commands. Configure SQL Server credentials only in `backend/.env` (never commit it). Run the starter schema only after reviewing and confirming the target database.

Crystal report templates belong under `crystal-reports/`. The Express service dynamically discovers `.rpt` files. PDF rendering requires a separately installed compatible Crystal Reports bridge, configured using `CRYSTAL_RENDERER_URL`.
