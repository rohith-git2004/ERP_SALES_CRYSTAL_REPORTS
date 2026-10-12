require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { getPool } = require('./db');
const orders = require('./routes/orders');
const reports = require('./routes/reports');
const app = express();
const port = Number(process.env.PORT || 3000);
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:4200').split(',').map(s => s.trim());
app.use(helmet());
app.use(cors({ origin(origin, cb) { if (!origin || allowedOrigins.includes(origin)) return cb(null, true); return cb(new Error('Origin not allowed by CORS')); } }));
app.use(express.json({ limit: '2mb' }));
app.get('/api/health', async (_req, res) => {
  try { await getPool(); res.json({ status: 'ok', api: true, database: 'connected' }); }
  catch (e) { res.status(503).json({ status: 'degraded', api: true, database: 'disconnected', message: e.message }); }
});
app.use('/api/orders', orders);
app.use('/api/reports', reports);
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = Number(err.statusCode) || 500;
  const message = process.env.NODE_ENV === 'production' && status === 500 ? 'Internal server error' : err.message;
  res.status(status).json({ error: message });
});
app.listen(port, () => console.log(`ERP Sales API listening at http://localhost:${port}`));
