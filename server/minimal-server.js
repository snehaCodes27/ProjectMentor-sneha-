const http = require('http');

console.log('Starting minimal server...');

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  console.log(`${req.method} ${req.url}`);

  // Handle different routes
  if (req.method === 'POST' && req.url === '/member-requests') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const data = JSON.parse(body);
      console.log('Member request:', data);
      
      const response = {
        success: true,
        request: {
          _id: 'mock-' + Date.now(),
          ...data,
          timestamp: new Date().toISOString(),
          status: 'pending'
        }
      };
      
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
    });
    return;
  }

  if (req.method === 'GET' && req.url.startsWith('/member-requests/')) {
    const teamCode = req.url.split('/')[2];
    console.log('Getting requests for team:', teamCode);
    
    const response = {
      success: true,
      requests: [{
        _id: 'mock-1',
        teamName: 'vns',
        teamCode: teamCode,
        memberName: 'SNEHA',
        memberEmail: 'snehamatkar3@gmail.com',
        memberUid: 'pending-' + Date.now(),
        timestamp: new Date().toISOString(),
        status: 'pending'
      }]
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
    return;
  }

  if (req.method === 'PUT' && req.url.includes('/accept')) {
    const requestId = req.url.split('/')[2];
    console.log('Accepting request:', requestId);
    
    const response = {
      success: true,
      message: 'Member accepted'
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
    return;
  }

  if (req.method === 'PUT' && req.url.includes('/reject')) {
    const requestId = req.url.split('/')[2];
    console.log('Rejecting request:', requestId);
    
    const response = {
      success: true,
      message: 'Member rejected'
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
    return;
  }

  // Default response
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: true, message: 'Server is working!' }));
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 Minimal server running on port ${PORT}`);
  console.log('✅ All endpoints ready!');
});
