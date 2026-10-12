
const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const crypto = require('node:crypto');

const PORT = 3010;
const SCRIPT = path.join(__dirname, 'render.vbs');
const REPORT_ROOT = path.resolve(__dirname, '..', 'crystal-reports');
const CScript = path.join(
  process.env.WINDIR || 'C:\\Windows',
  'SysWOW64',
  'cscript.exe'
);

const server = http.createServer((req, res) => {
  if (req.method !== 'POST' || req.url !== '/render') {
    res.writeHead(404);
    return res.end('Not found');
  }

  let body = '';
  req.setEncoding('utf8');

  req.on('data', chunk => {
    body += chunk;

    if (body.length > 1024 * 1024) {
      res.writeHead(413);
      res.end('Request too large');
      req.destroy();
    }
  });

  req.on('end', () => {
    let request;

    try {
      request = JSON.parse(body);
    } catch {
      res.writeHead(400);
      return res.end('Invalid JSON');
    }

    const reportPath = path.resolve(
      String(request.reportPath || '')
    );

    if (
      !reportPath.startsWith(REPORT_ROOT + path.sep) ||
      !reportPath.toLowerCase().endsWith('.rpt') ||
      !fs.existsSync(reportPath)
    ) {
      res.writeHead(400);
      return res.end('Invalid report path');
    }

    console.log('Bridge received parameters:', request.parameters);

    const orderId = String(
      request.parameters?.orderId || ''
    ).trim();

    const outputPath = path.join(
      os.tmpdir(),
      `crystal-${crypto.randomUUID()}.pdf`
    );

    const child = spawn(
      CScript,
      [
        '//nologo',
        SCRIPT,
        reportPath,
        outputPath,
        orderId
      ],
      { windowsHide: true }
    );

    let output = '';

    child.stdout.on('data', chunk => {
      output += chunk.toString();
    });

    child.stderr.on('data', chunk => {
      output += chunk.toString();
    });

    child.on('error', err => {
      if (!res.headersSent) {
        res.writeHead(500);
        res.end(
          `Could not start Crystal bridge: ${err.message}`
        );
      }
    });

    child.on('close', code => {
      if (res.writableEnded || res.destroyed) return;

      if (code !== 0 || !fs.existsSync(outputPath)) {
        res.writeHead(502);
        return res.end(output || 'Crystal export failed');
      }

      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Length': fs.statSync(outputPath).size
      });

      const stream = fs.createReadStream(outputPath);

      stream.on('error', () => res.destroy());

      stream.on('close', () => {
        fs.rm(outputPath, { force: true }, () => {});
      });

      stream.pipe(res);
    });
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(
    `Crystal bridge listening at http://127.0.0.1:${PORT}`
  );
});
