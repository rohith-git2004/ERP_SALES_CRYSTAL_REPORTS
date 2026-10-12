const express = require('express');
const { getPool, sql } = require('../db');
const router = express.Router();

function parseJsonItems(value) {
  if (!value) return [];
  try { return JSON.parse(value); } catch { return []; }
}
function mapOrder(row) {
  return {
    id: row.OrderId, voucherNumber: row.VoucherNumber, voucherType: row.VoucherType,
    routePlan: row.RoutePlan, date: row.OrderDate, customer: row.Customer,
    balance: Number(row.Balance), overdue: Number(row.Overdue), lastPayment: row.LastPayment || '',
    deliveryDate: row.DeliveryDate || '', notes: row.Notes || '', status: row.Status,
    authorized: row.Authorized, isDraft: row.IsDraft, items: parseJsonItems(row.ItemsJson)
  };
}
router.get('/', async (req, res, next) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`SELECT TOP (500) * FROM dbo.SalesOrders ORDER BY CreatedAt DESC`);
    res.json(result.recordset.map(mapOrder));
  } catch (e) { next(e); }
});
router.get('/:id', async (req, res, next) => {
  try {
    const pool = await getPool();
    const result = await pool.request().input('id', sql.NVarChar(40), req.params.id)
      .query('SELECT * FROM dbo.SalesOrders WHERE OrderId=@id');
    if (!result.recordset.length) return res.status(404).json({ error: 'Sales order not found' });
    res.json(mapOrder(result.recordset[0]));
  } catch (e) { next(e); }
});
router.post('/', async (req, res, next) => {
  try {
    const o = req.body || {};
    if (!o.customer || !Array.isArray(o.items)) return res.status(400).json({ error: 'customer and items[] are required' });
    const id = o.id || `SO-${Date.now()}`;
    const voucher = o.voucherNumber || `VR-${Date.now()}`;
    const authorized = Boolean(o.authorized);
    const status = authorized ? 'Approved' : 'Pending';
    const pool = await getPool();
    await pool.request()
      .input('id', sql.NVarChar(40), id).input('voucher', sql.NVarChar(40), voucher)
      .input('voucherType', sql.NVarChar(80), o.voucherType || 'Voucher Receipt')
      .input('routePlan', sql.NVarChar(150), o.routePlan || '').input('date', sql.Date, o.date || new Date())
      .input('customer', sql.NVarChar(200), o.customer).input('balance', sql.Decimal(18,2), Number(o.balance || 0))
      .input('overdue', sql.Decimal(18,2), Number(o.overdue || 0)).input('lastPayment', sql.NVarChar(100), o.lastPayment || '')
      .input('deliveryDate', sql.Date, o.deliveryDate || null).input('notes', sql.NVarChar(sql.MAX), o.notes || '')
      .input('status', sql.NVarChar(30), status).input('authorized', sql.Bit, authorized)
      .input('isDraft', sql.Bit, Boolean(o.isDraft) && !authorized).input('items', sql.NVarChar(sql.MAX), JSON.stringify(o.items))
      .query(`MERGE dbo.SalesOrders AS t USING (SELECT @id AS OrderId) AS s ON t.OrderId=s.OrderId
      WHEN MATCHED THEN UPDATE SET VoucherNumber=@voucher,VoucherType=@voucherType,RoutePlan=@routePlan,OrderDate=@date,Customer=@customer,Balance=@balance,Overdue=@overdue,LastPayment=@lastPayment,DeliveryDate=@deliveryDate,Notes=@notes,Status=@status,Authorized=@authorized,IsDraft=@isDraft,ItemsJson=@items,UpdatedAt=SYSUTCDATETIME()
      WHEN NOT MATCHED THEN INSERT (OrderId,VoucherNumber,VoucherType,RoutePlan,OrderDate,Customer,Balance,Overdue,LastPayment,DeliveryDate,Notes,Status,Authorized,IsDraft,ItemsJson) VALUES (@id,@voucher,@voucherType,@routePlan,@date,@customer,@balance,@overdue,@lastPayment,@deliveryDate,@notes,@status,@authorized,@isDraft,@items);`);
    res.status(201).json({ ...o, id, voucherNumber: voucher, status, authorized, isDraft: Boolean(o.isDraft) && !authorized });
  } catch (e) { next(e); }
});
router.patch('/:id/authorize', async (req, res, next) => {
  try {
    const authorized = Boolean(req.body && req.body.authorized);
    const pool = await getPool();
    const result = await pool.request().input('id', sql.NVarChar(40), req.params.id)
      .input('authorized', sql.Bit, authorized)
      .query(`UPDATE dbo.SalesOrders SET Authorized=@authorized, Status=CASE WHEN @authorized=1 THEN 'Approved' ELSE 'Pending' END, IsDraft=CASE WHEN @authorized=1 THEN 0 ELSE IsDraft END, UpdatedAt=SYSUTCDATETIME() WHERE OrderId=@id; SELECT @@ROWCOUNT AS affected;`);
    if (!result.recordset[0].affected) return res.status(404).json({ error: 'Sales order not found' });
    res.json({ id: req.params.id, authorized, status: authorized ? 'Approved' : 'Pending' });
  } catch (e) { next(e); }
});
router.delete('/:id', async (req, res, next) => {
  try {
    const pool = await getPool();
    const result = await pool.request().input('id', sql.NVarChar(40), req.params.id)
      .query('DELETE FROM dbo.SalesOrders WHERE OrderId=@id; SELECT @@ROWCOUNT AS affected;');
    if (!result.recordset[0].affected) return res.status(404).json({ error: 'Sales order not found' });
    res.status(204).end();
  } catch (e) { next(e); }
});
module.exports = router;
