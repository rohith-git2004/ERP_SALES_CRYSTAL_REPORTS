
const express = require('express');
const {
  listReports,
  resolveReport,
  renderPdf
} = require('../services/crystalReports');

const router = express.Router();

// GET /api/reports
router.get('/', (_req, res) => {
  res.json({ reports: listReports() });
});

// POST /api/reports/SalesOrder/pdf
router.post('/:reportPath(*)', async (req, res, next) => {
  try {
    const requestedPath = req.params.reportPath || '';

    if (!requestedPath.endsWith('/pdf')) {
      return res.status(404).json({
        error: 'Report endpoint not found.'
      });
    }

    const reportKey = requestedPath
      .slice(0, -4)
      .replace(/\/+$/, '');

    const report = resolveReport(reportKey);

    if (!report) {
      return res.status(404).json({
        error: 'Report template not found.',
        requestedKey: reportKey,
        availableReports: listReports()
      });
    }

    const parameters = req.body?.parameters ?? {};

    if (
      !parameters ||
      typeof parameters !== 'object' ||
      Array.isArray(parameters)
    ) {
      return res.status(400).json({
        error: 'parameters must be a JSON object.'
      });
    }

    const pdf = await renderPdf(report, parameters);
    const safeName = report.key
      .split('/')
      .pop()
      .replace(/[^a-zA-Z0-9_-]/g, '_');

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${safeName}.pdf"`,
      'Content-Length': String(pdf.length),
      'Cache-Control': 'no-store'
    });

    res.send(pdf);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
