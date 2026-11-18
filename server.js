
const http = require('http');

const PORT = process.env.PORT || 3000;

// Simulated health state; flip it via GET /toggle to trigger/resolve an outage
let healthy = true;

const server = http.createServer((req, res) => {

  // Toggle endpoint: flips /health between 200 and 500 (POC only)
  if (req.method === 'GET' && req.url === '/toggle') {
    healthy = !healthy;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ healthy }));
  }

  // Health endpoint: HTTP 200 when healthy, HTTP 500 when toggled down
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(healthy ? 200 : 500, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      status: healthy ? 'ok' : 'down',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }));
  }

  // Failure endpoint: HTTP 500
  if (req.method === 'GET' && req.url === '/api/test-error') {
    res.writeHead(500, {
      'Content-Type': 'application/json'
    });

    return res.end(JSON.stringify({
      success: false,
      message: 'Internal Server Error',
      statusCode: 500
    }));
  }

  // Root endpoint: HTTP 200
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end('Server is running\n');
  }

  // Unknown endpoint: HTTP 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

process.on('SIGINT', () => server.close(() => process.exit(0)));
process.on('SIGTERM', () => server.close(() => process.exit(0)));
