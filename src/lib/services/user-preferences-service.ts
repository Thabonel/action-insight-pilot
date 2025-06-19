
import { apiClient } from '@/lib/api-client';
import { ApiResponse } from '@/lib/api-client-interface';

export interface UserPreference {
  id: string;
  category: string;
  key: string;
  value: any;
  lastUpdated: string;
}

export class UserPreferencesService {
  static async getPreferences(category?: string): Promise<ApiResponse<UserPreference[]>> {
    try {
      const response = category 
        ? await apiClient.userPreferences.getUserPreferences(category)
        : await apiClient.userPreferences.get();
      
      return {
        success: response.success,
        data: Array.isArray(response.data) ? response.data : [],
        error: response.error
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to get user preferences'
      };
    }
  }

  static async updatePreferences(category: string, preferences: any): Promise<ApiResponse<UserPreference[]>> {
    try {
      const response = await apiClient.userPreferences.updateUserPreferences(category, preferences);
      return {
        success: response.success,
        data: response.data,
        error: response.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user preferences'
      };
    }
  }
}
