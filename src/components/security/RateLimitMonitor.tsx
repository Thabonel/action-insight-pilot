import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRateLimiter } from '@/hooks/useRateLimiter';
import { Activity, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

const RateLimitMonitor: React.FC = () => {
  const { getRateLimitStatus, resetLimits } = useRateLimiter();
  const [endpoints, setEndpoints] = useState([
    'ai-api', 'social-post', 'auth-attempt', 'general'
  ]);
  const [statuses, setStatuses] = useState<Record<string, any>>({});

  useEffect(() => {
    const updateStatuses = () => {
      const newStatuses: Record<string, any> = {};
      endpoints.forEach(endpoint => {
        newStatuses[endpoint] = getRateLimitStatus(endpoint);
      });
      setStatuses(newStatuses);
    };

    updateStatuses();
    const interval = setInterval(updateStatuses, 1000);
    return () => clearInterval(interval);
  }, [endpoints, getRateLimitStatus]);

  const getStatusColor = (status: any) => {
    if (status.blocked) return 'destructive';
    if (status.remainingRequests < status.maxRequests * 0.2) return 'outline';
    return 'default';
  };

  const getUsagePercentage = (status: any) => {
    return ((status.requests / status.maxRequests) * 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Rate Limit Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {endpoints.map(endpoint => {
          const status = statuses[endpoint];
          if (!status) return null;

          return (
            <div key={endpoint} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium capitalize">
                    {endpoint.replace('-', ' ')} API
                  </h4>
                  <Badge variant={getStatusColor(status)}>
                    {status.blocked ? (
                      <>
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Blocked
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </>
                    )}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {status.requests}/{status.maxRequests} requests
                </div>
              </div>

              <Progress 
                value={getUsagePercentage(status)} 
                className="mb-2"
              />

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {status.remainingRequests} remaining
                </span>
                {status.resetTime && (
                  <span className="text-muted-foreground">
                    Resets: {new Date(status.resetTime).toLocaleTimeString()}
                  </span>
                )}
              </div>

              {status.blocked && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  This endpoint is currently rate limited. 
                  {status.resetTime && (
                    <> Try again after {new Date(status.resetTime).toLocaleTimeString()}.</>
                  )}
                </div>
              )}
            </div>
          );
        })}

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Rate limits help prevent abuse and ensure fair usage
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => resetLimits()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset All Limits
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RateLimitMonitor;