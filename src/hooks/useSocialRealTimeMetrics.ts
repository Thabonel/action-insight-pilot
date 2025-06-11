
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SocialMetricsUpdate {
  post_id: string;
  platform: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  engagement_rate: number;
  reach: number;
}

interface SocialMetricsData {
  [postId: string]: SocialMetricsUpdate;
}

export function useSocialRealTimeMetrics(postIds: string[] = []) {
  const [metricsData, setMetricsData] = useState<SocialMetricsData>({});
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (postIds.length === 0) return;

    // Connect to WebSocket for real-time metrics
    const connectWebSocket = () => {
      try {
        // Replace with your actual Supabase project URL
        const wsUrl = `wss://your-project.supabase.co/functions/v1/social-metrics-stream`;
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log('Connected to social metrics stream');
          setIsConnected(true);
          setError(null);
          
          // Send subscription message for post IDs
          if (wsRef.current) {
            wsRef.current.send(JSON.stringify({
              type: 'subscribe',
              post_ids: postIds
            }));
          }
        };

        wsRef.current.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            
            if (message.type === 'metrics_update') {
              const update: SocialMetricsUpdate = message.data;
              
              setMetricsData(prev => ({
                ...prev,
                [update.post_id]: update
              }));
            }
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
          }
        };

        wsRef.current.onclose = () => {
          console.log('Disconnected from social metrics stream');
          setIsConnected(false);
          
          // Attempt to reconnect after 5 seconds
          setTimeout(connectWebSocket, 5000);
        };

        wsRef.current.onerror = (err) => {
          console.error('WebSocket error:', err);
          setError('Failed to connect to real-time metrics');
          setIsConnected(false);
        };

      } catch (err) {
        console.error('Error creating WebSocket connection:', err);
        setError('Failed to initialize real-time connection');
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [postIds]);

  const getMetricsForPost = (postId: string): SocialMetricsUpdate | null => {
    return metricsData[postId] || null;
  };

  const getAllMetrics = (): SocialMetricsUpdate[] => {
    return Object.values(metricsData);
  };

  const refreshMetrics = () => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(JSON.stringify({
        type: 'refresh',
        post_ids: postIds
      }));
      
      toast({
        title: "Metrics Refreshed",
        description: "Social media metrics have been updated",
      });
    }
  };

  return {
    metricsData,
    isConnected,
    error,
    getMetricsForPost,
    getAllMetrics,
    refreshMetrics
  };
}
