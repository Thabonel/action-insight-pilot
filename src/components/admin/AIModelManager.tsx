import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, RefreshCw, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';
import type {
  AIModelConfig,
  AIModelUpdateLog,
  AllModelsResponse,
  ModelHistoryResponse,
} from '@/types/ai-models';

export const AIModelManager: React.FC = () => {
  const [models, setModels] = useState<AIModelConfig[]>([]);
  const [logs, setLogs] = useState<AIModelUpdateLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [discovering, setDiscovering] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>('all');

  useEffect(() => {
    loadModels();
    loadLogs();
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke<AllModelsResponse>('ai-model-config/all');

      if (error) throw error;

      if (data?.success && data.models) {
        setModels(data.models);
      }
    } catch (error) {
      console.error('Error loading models:', error);
      toast.error('Failed to load AI models');
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      const { data, error } = await supabase.functions.invoke<ModelHistoryResponse>(
        'ai-model-config/history',
        { body: { limit: 10 } }
      );

      if (error) throw error;

      if (data?.success && data.logs) {
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const triggerDiscovery = async () => {
    try {
      setDiscovering(true);
      toast.info('Starting AI model discovery... This may take a minute.');

      const { data, error } = await supabase.functions.invoke('ai-model-updater');

      if (error) throw error;

      if (data?.success) {
        toast.success(
          `Discovery complete! Added ${data.models_added} models, deprecated ${data.models_deprecated} models.`
        );
        await loadModels();
        await loadLogs();
      } else {
        toast.error('Model discovery failed. Check logs for details.');
      }
    } catch (error) {
      console.error('Error triggering discovery:', error);
      toast.error('Failed to trigger model discovery');
    } finally {
      setDiscovering(false);
    }
  };

  const getModelTypeColor = (type: string) => {
    switch (type) {
      case 'flagship':
        return 'bg-purple-500';
      case 'fast':
        return 'bg-blue-500';
      case 'legacy':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'openai':
        return 'bg-green-500';
      case 'anthropic':
        return 'bg-orange-500';
      case 'google':
        return 'bg-red-500';
      case 'mistral':
        return 'bg-indigo-500';
      default:
        return 'bg-gray-500';
    }
  };

  const filteredModels =
    selectedProvider === 'all'
      ? models
      : models.filter((m) => m.provider === selectedProvider);

  const providers = ['all', ...Array.from(new Set(models.map((m) => m.provider)))];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">AI Model Management</h2>
          <p className="text-muted-foreground mt-1">
            Manage and monitor AI models across all providers
          </p>
        </div>
        <Button onClick={triggerDiscovery} disabled={discovering}>
          {discovering ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Discovering...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Discover Models
            </>
          )}
        </Button>
      </div>

      <div className="flex gap-2">
        {providers.map((provider) => (
          <Button
            key={provider}
            variant={selectedProvider === provider ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedProvider(provider)}
            className="capitalize"
          >
            {provider}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Models ({filteredModels.length})</CardTitle>
          <CardDescription>
            Models currently available for use across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredModels.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No models found. Try running model discovery.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredModels.map((model) => (
                <div
                  key={model.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className={getProviderColor(model.provider)}>
                          {model.provider}
                        </Badge>
                        <Badge className={getModelTypeColor(model.model_type)}>
                          {model.model_type}
                        </Badge>
                        {model.is_default && (
                          <Badge variant="outline">Default</Badge>
                        )}
                        {!model.is_active && (
                          <Badge variant="destructive">Inactive</Badge>
                        )}
                      </div>
                      <h4 className="font-semibold text-lg">{model.model_name}</h4>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(model.discovered_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Context:</span>
                      <div className="font-medium">
                        {model.context_window
                          ? `${(model.context_window / 1000).toFixed(0)}K tokens`
                          : 'Unknown'}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Pricing:</span>
                      <div className="font-medium">
                        {model.pricing?.input_per_mtok ? (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {model.pricing.input_per_mtok.toFixed(2)}/M
                          </span>
                        ) : (
                          'N/A'
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Capabilities:</span>
                      <div className="flex gap-1 mt-1">
                        {model.capabilities?.vision && (
                          <Badge variant="secondary" className="text-xs">
                            Vision
                          </Badge>
                        )}
                        {model.capabilities?.function_calling && (
                          <Badge variant="secondary" className="text-xs">
                            Functions
                          </Badge>
                        )}
                        {model.capabilities?.reasoning && (
                          <Badge variant="secondary" className="text-xs">
                            Reasoning
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <div className="flex items-center gap-1 mt-1">
                        {model.last_validated_at ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-xs">Validated</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-yellow-500" />
                            <span className="text-xs">Not validated</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Update History</CardTitle>
          <CardDescription>
            Recent model discovery runs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No update history available yet.
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="border rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {log.status === 'success' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : log.status === 'partial' ? (
                        <Clock className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium">
                        {new Date(log.run_date).toLocaleString()}
                      </span>
                      <Badge variant="outline">{log.status}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground flex gap-4">
                      <span>Discovered: {log.models_discovered}</span>
                      <span>Added: {log.models_added}</span>
                      <span>Deprecated: {log.models_deprecated}</span>
                      <span>Time: {log.execution_time_ms}ms</span>
                    </div>
                    {log.providers_checked && (
                      <div className="flex gap-1 mt-1">
                        {log.providers_checked.map((provider) => (
                          <Badge
                            key={provider}
                            variant="secondary"
                            className="text-xs"
                          >
                            {provider}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
