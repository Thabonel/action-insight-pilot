const endpoints = [
  {
    name: 'Frontend',
    url: 'https://your-domain.com/health',
    expectedStatus: 200
  },
  {
    name: 'Backend API',
    url: 'https://your-api-domain.com/health',
    expectedStatus: 200
  },
  {
    name: 'Supabase',
    url: 'https://kciuuxoqxfsogjuqflou.supabase.co/rest/v1/',
    expectedStatus: 200,
    headers: {
      'apikey': process.env.SUPABASE_ANON_KEY
    }
  }
];

async function checkEndpoint(endpoint) {
  try {
    const response = await fetch(endpoint.url, {
      method: 'GET',
      headers: endpoint.headers || {},
      timeout: 10000
    });

    const isHealthy = response.status === endpoint.expectedStatus;
    const responseTime = response.headers.get('X-Response-Time') || 'N/A';

    return {
      name: endpoint.name,
      url: endpoint.url,
      status: response.status,
      healthy: isHealthy,
      responseTime,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      name: endpoint.name,
      url: endpoint.url,
      status: 0,
      healthy: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function runHealthChecks() {
  console.log('🏥 Running health checks...');
  
  const results = await Promise.all(
    endpoints.map(endpoint => checkEndpoint(endpoint))
  );

  const healthyCount = results.filter(r => r.healthy).length;
  const totalCount = results.length;

  console.log(`\n📊 Health Check Results (${healthyCount}/${totalCount} healthy):`);
  console.log('='.repeat(60));

  results.forEach(result => {
    const status = result.healthy ? '✅' : '❌';
    console.log(`${status} ${result.name}: ${result.status} (${result.responseTime})`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  // Log to file for monitoring
  const logEntry = {
    timestamp: new Date().toISOString(),
    summary: { healthy: healthyCount, total: totalCount },
    results
  };

  // You can send this to a monitoring service like DataDog, New Relic, etc.
  console.log('\n📝 Log entry:', JSON.stringify(logEntry, null, 2));

  return healthyCount === totalCount;
}

// Run checks
if (require.main === module) {
  runHealthChecks()
    .then(allHealthy => {
      process.exit(allHealthy ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Health check failed:', error);
      process.exit(1);
    });
}

module.exports = { runHealthChecks, checkEndpoint };