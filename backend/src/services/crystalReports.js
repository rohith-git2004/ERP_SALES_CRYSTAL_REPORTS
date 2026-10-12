
const fs = require('node:fs');
const path = require('node:path');

const reportsRoot = path.resolve(
  process.env.CRYSTAL_REPORTS_DIR ||
    path.join(__dirname, '..', '..', '..', 'crystal-reports')
);

function walkReports(directory, relativeToRoot = '') {
  if (!fs.existsSync(directory)) return [];

  const results = [];

  for (const entry of fs.readdirSync(directory, {
    withFileTypes: true
  })) {
    const absolute = path.join(directory, entry.name);
    const relative = path.join(relativeToRoot, entry.name);

    if (entry.isDirectory()) {
      results.push(...walkReports(absolute, relative));
    } else if (
      entry.isFile() &&
      entry.name.toLowerCase().endsWith('.rpt')
    ) {
      results.push({
        key: relative.slice(0, -4).split(path.sep).join('/'),
        fileName: entry.name,
        filePath: absolute
      });
    }
  }

  return results;
}

function listReports() {
  return walkReports(reportsRoot).map(({ key, fileName }) => ({
    key,
    fileName
  }));
}

function resolveReport(reportKey) {
  if (
    typeof reportKey !== 'string' ||
    !reportKey.trim() ||
    reportKey.includes('..') ||
    reportKey.includes('\\')
  ) {
    return null;
  }

  const normalizedKey = reportKey.replace(/^\/+|\/+$/g, '');
  const match = walkReports(reportsRoot).find(
    report => report.key === normalizedKey
  );

  if (!match) return null;

  const resolved = path.resolve(match.filePath);
  const root = path.resolve(reportsRoot);

  if (!resolved.startsWith(root + path.sep)) return null;

  return { ...match, key: normalizedKey };
}

async function renderPdf(report, parameters = {}) {
  const rendererUrl = process.env.CRYSTAL_RENDERER_URL;

  if (!rendererUrl) {
    const error = new Error(
      'Crystal renderer is not configured. A compatible Windows Crystal Reports bridge is required.'
    );
    error.statusCode = 503;
    throw error;
  }

  const timeoutMs = Number(
    process.env.CRYSTAL_RENDERER_TIMEOUT_MS || 60000
  );

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    timeoutMs
  );

  try {
    const response = await fetch(rendererUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/pdf'
      },
      body: JSON.stringify({
        reportKey: report.key,
        reportPath: report.filePath,
        parameters
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 1000);
      const error = new Error(
        `Crystal renderer returned HTTP ${response.status}${
          detail ? `: ${detail}` : ''
        }`
      );
      error.statusCode = 502;
      throw error;
    }

    const contentType = response.headers.get('content-type') || '';

    if (!contentType.toLowerCase().includes('application/pdf')) {
      const error = new Error(
        'Crystal renderer did not return application/pdf.'
      );
      error.statusCode = 502;
      throw error;
    }

    return Buffer.from(await response.arrayBuffer());
  } catch (error) {
    if (error.name === 'AbortError') {
      const timeoutError = new Error(
        'Crystal renderer request timed out.'
      );
      timeoutError.statusCode = 504;
      throw timeoutError;
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  listReports,
  resolveReport,
  renderPdf
};
