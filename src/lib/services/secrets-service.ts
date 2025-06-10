
import { supabase } from '@/integrations/supabase/client';

export interface SecretMetadata {
  service_name: string;
  created_at: string;
  updated_at: string;
  last_used_at: string | null;
  is_active: boolean;
  metadata: Record<string, any>;
}

export class SecretsService {
  private static async callSecretFunction(action: string, data?: any, params?: URLSearchParams) {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Authentication required');
    }

    const url = new URL('https://kciuuxoqxfsogjuqflou.supabase.co/functions/v1/manage-user-secrets');
    url.searchParams.set('action', action);
    
    if (params) {
      params.forEach((value, key) => url.searchParams.set(key, value));
    }

    const response = await fetch(url.toString(), {
      method: data ? 'POST' : 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to process secret operation');
    }

    return response.json();
  }

  static async saveSecret(serviceName: string, value: string): Promise<void> {
    await this.callSecretFunction('save', { serviceName, value });
  }

  static async listSecrets(): Promise<SecretMetadata[]> {
    const result = await this.callSecretFunction('list');
    return result.secrets || [];
  }

  static async deleteSecret(serviceName: string): Promise<void> {
    await this.callSecretFunction('delete', { serviceName });
  }

  static async getSecret(serviceName: string): Promise<string> {
    const params = new URLSearchParams({ serviceName });
    const result = await this.callSecretFunction('get', undefined, params);
    return result.value;
  }

  static async hasSecret(serviceName: string): Promise<boolean> {
    try {
      const secrets = await this.listSecrets();
      return secrets.some(secret => secret.service_name === serviceName);
    } catch {
      return false;
    }
  }
}
