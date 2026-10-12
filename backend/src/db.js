const sql = require('mssql');
require('dotenv').config();

const config = {
  server: process.env.DB_SERVER || 'localhost',
  port: Number(process.env.DB_PORT || 1433),
  database: process.env.DB_DATABASE || 'ERP_SALES',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: String(process.env.DB_ENCRYPT || 'false').toLowerCase() === 'true',
    trustServerCertificate: String(process.env.DB_TRUST_SERVER_CERTIFICATE || 'true').toLowerCase() === 'true',
    enableArithAbort: true
  },
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
  connectionTimeout: 15000,
  requestTimeout: 30000
};

let poolPromise;
function getPool() {
  if (!process.env.DB_USER || !process.env.DB_PASSWORD) {
    throw new Error('Database credentials are not configured. Copy .env.example to .env and fill in DB_USER and DB_PASSWORD.');
  }
  if (!poolPromise) poolPromise = new sql.ConnectionPool(config).connect().catch(err => { poolPromise = null; throw err; });
  return poolPromise;
}
module.exports = { sql, getPool };
