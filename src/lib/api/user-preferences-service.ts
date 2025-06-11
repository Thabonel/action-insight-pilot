
import { HttpClient } from '../http-client';

export interface UserPreference {
  id: string;
  user_id: string;
  preference_category: string;
  preference_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export class UserPreferencesService {
  constructor(private httpClient: HttpClient) {}

  async getUserPreferences(category?: string) {
    const endpoint = category 
      ? `/api/user-preferences?category=${category}`
      : '/api/user-preferences';
    return this.httpClient.request<UserPreference[]>(endpoint);
  }

  async updateUserPreferences(category: string, data: Record<string, any>) {
    return this.httpClient.request<UserPreference>('/api/user-preferences', {
      method: 'POST',
      body: JSON.stringify({
        preference_category: category,
        preference_data: data
      }),
    });
  }

  async getWorkspaceSettings() {
    return this.getUserPreferences('workspace');
  }

  async updateWorkspaceSettings(settings: Record<string, any>) {
    return this.updateUserPreferences('workspace', settings);
  }

  async getAIBehaviorSettings() {
    return this.getUserPreferences('ai_behavior');
  }

  async updateAIBehaviorSettings(settings: Record<string, any>) {
    return this.updateUserPreferences('ai_behavior', settings);
  }

  async getSystemPreferences() {
    return this.getUserPreferences('system');
  }

  async updateSystemPreferences(preferences: Record<string, any>) {
    return this.updateUserPreferences('system', preferences);
  }
}
