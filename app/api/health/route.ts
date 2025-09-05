import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: process.uptime(),
      checks: {
        database: 'unknown',
        api: 'healthy',
        memory: 'healthy',
      },
      performance: {
        responseTime: 0,
        memoryUsage: process.memoryUsage(),
      },
    };
    
    // Check database connection
    try {
      if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        const redis = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
        
        await redis.ping();
        health.checks.database = 'healthy';
      } else {
        health.checks.database = 'not_configured';
      }
    } catch (error) {
      health.checks.database = 'unhealthy';
      health.status = 'degraded';
    }
    
    // Check memory usage
    const memoryUsage = process.memoryUsage();
    const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    
    if (memoryUsagePercent > 90) {
      health.checks.memory = 'critical';
      health.status = 'unhealthy';
    } else if (memoryUsagePercent > 75) {
      health.checks.memory = 'warning';
      if (health.status === 'healthy') {
        health.status = 'degraded';
      }
    }
    
    // Calculate response time
    health.performance.responseTime = Date.now() - startTime;
    
    // Determine overall status
    const unhealthyChecks = Object.values(health.checks).filter(
      status => status === 'unhealthy' || status === 'critical'
    );
    
    if (unhealthyChecks.length > 0) {
      health.status = 'unhealthy';
    }
    
    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 503;
    
    return NextResponse.json(health, { status: statusCode });
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      performance: {
        responseTime: Date.now() - startTime,
      },
    }, { status: 503 });
  }
}

// Detailed health check with more information
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { includeDetails = false } = body;
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: process.uptime(),
      checks: {
        database: 'unknown',
        api: 'healthy',
        memory: 'healthy',
        external_apis: 'unknown',
      },
      performance: {
        responseTime: 0,
        memoryUsage: process.memoryUsage(),
      },
      details: includeDetails ? {
        environment: process.env.NODE_ENV,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      } as any : undefined,
    };
    
    // Check database connection
    try {
      if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        const redis = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
        
        const pingStart = Date.now();
        await redis.ping();
        const pingTime = Date.now() - pingStart;
        
        health.checks.database = pingTime < 100 ? 'healthy' : 'slow';
        
        if (includeDetails) {
          health.details = {
            ...health.details,
            database: {
              pingTime,
              status: health.checks.database,
            },
          };
        }
      } else {
        health.checks.database = 'not_configured';
      }
    } catch (error) {
      health.checks.database = 'unhealthy';
      health.status = 'degraded';
      
      if (includeDetails) {
        health.details = {
          ...health.details,
          database: {
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        };
      }
    }
    
    // Check external APIs
    try {
      const coingeckoStart = Date.now();
      const response = await fetch('https://api.coingecko.com/api/v3/ping', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      
      const coingeckoTime = Date.now() - coingeckoStart;
      health.checks.external_apis = response.ok ? 'healthy' : 'degraded';
      
      if (includeDetails) {
        health.details = {
          ...health.details,
          external_apis: {
            coingecko: {
              responseTime: coingeckoTime,
              status: response.status,
              healthy: response.ok,
            },
          },
        };
      }
    } catch (error) {
      health.checks.external_apis = 'unhealthy';
      
      if (includeDetails) {
        health.details = {
          ...health.details,
          external_apis: {
            coingecko: {
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          },
        };
      }
    }
    
    // Check memory usage
    const memoryUsage = process.memoryUsage();
    const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    
    if (memoryUsagePercent > 90) {
      health.checks.memory = 'critical';
      health.status = 'unhealthy';
    } else if (memoryUsagePercent > 75) {
      health.checks.memory = 'warning';
      if (health.status === 'healthy') {
        health.status = 'degraded';
      }
    }
    
    if (includeDetails) {
      health.details = {
        ...health.details,
        memory: {
          usagePercent: Math.round(memoryUsagePercent * 100) / 100,
          heapUsed: memoryUsage.heapUsed,
          heapTotal: memoryUsage.heapTotal,
          external: memoryUsage.external,
          rss: memoryUsage.rss,
        },
      };
    }
    
    // Calculate response time
    health.performance.responseTime = Date.now() - startTime;
    
    // Determine overall status
    const unhealthyChecks = Object.values(health.checks).filter(
      status => status === 'unhealthy' || status === 'critical'
    );
    
    if (unhealthyChecks.length > 0) {
      health.status = 'unhealthy';
    }
    
    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 503;
    
    return NextResponse.json(health, { status: statusCode });
    
  } catch (error) {
    console.error('Detailed health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      performance: {
        responseTime: Date.now() - startTime,
      },
    }, { status: 503 });
  }
}
