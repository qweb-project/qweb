const { processUrlPayment, makeX402Payment, checkPaymentInfo } = require('./lib/server-wallet');

// Test function that can be called via HTTP endpoint or directly
async function testX402Payment(url, userAddress) {
  try {
    console.log(`🧪 Testing x402 payment for URL: ${url}`);
    console.log(`👤 User address: ${userAddress}`);
    
    const result = await processUrlPayment(url, userAddress);
    
    console.log('\n📊 Test Results:');
    console.log(JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error.message,
      step: 'test_error'
    };
  }
}

// Simple HTTP server for testing via curl
const http = require('http');
const url = require('url');

const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  
  if (parsedUrl.pathname === '/test-x402' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const { testUrl, userAddress } = JSON.parse(body);
        
        if (!testUrl || !userAddress) {
          res.writeHead(400);
          res.end(JSON.stringify({ 
            error: 'Missing testUrl or userAddress in request body' 
          }));
          return;
        }
        
        const result = await testX402Payment(testUrl, userAddress);
        
        res.writeHead(200);
        res.end(JSON.stringify(result, null, 2));
      } catch (error) {
        res.writeHead(500);
        res.end(JSON.stringify({ 
          error: error.message 
        }));
      }
    });
  } else if (parsedUrl.pathname === '/test-payment-info' && req.method === 'GET') {
    const testUrl = parsedUrl.query.url;
    
    if (!testUrl) {
      res.writeHead(400);
      res.end(JSON.stringify({ 
        error: 'Missing url query parameter' 
      }));
      return;
    }
    
    try {
      const result = await checkPaymentInfo(testUrl);
      res.writeHead(200);
      res.end(JSON.stringify(result, null, 2));
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({ 
        error: error.message 
      }));
    }
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ 
      error: 'Not found',
      availableEndpoints: [
        'POST /test-x402 - Test complete payment flow',
        'GET /test-payment-info?url=<url> - Check payment info'
      ]
    }));
  }
});

const PORT = 3002;
server.listen(PORT, () => {
  console.log(`
🧪 x402 Test Server Running
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 Port: ${PORT}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Test Endpoints:
   POST /test-x402
   GET  /test-payment-info?url=<url>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 Example curl commands:

# Check payment info
curl "http://localhost:3002/test-payment-info?url=example.com"

# Test complete payment flow
curl -X POST http://localhost:3002/test-x402 \\
  -H "Content-Type: application/json" \\
  -d '{
    "testUrl": "example.com",
    "userAddress": "0x1234567890123456789012345678901234567890"
  }'
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
});

// Export for direct usage
module.exports = {
  testX402Payment
};
