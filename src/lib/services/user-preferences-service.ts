
import { apiClient } from '@/lib/api-client';
import { ApiResponse, UserPreferences } from '@/lib/api-client-interface';

export class UserPreferencesService {
  static async getUserPreferences(category: string): Promise<ApiResponse<UserPreferences>> {
    try {
      const response = await apiClient.userPreferences.getUserPreferences(category);
      
      if (response.success && response.data && response.data.length > 0) {
        return {
          success: true,
          data: response.data[0].preference_data || {}
        };
      }
      
      return {
        success: false,
        data: {} as UserPreferences,
        error: 'No preferences found'
      };
    } catch (error) {
      return {
        success: false,
        data: {} as UserPreferences,
        error: error instanceof Error ? error.message : 'Failed to get user preferences'
      };
    }
  }

  static async updateUserPreferences(category: string, preferences: UserPreferences): Promise<ApiResponse<UserPreferences>> {
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

  static async getPreferencesByCategory(category: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.userPreferences.get(category);
      return {
        success: response.success,
        data: response.data,
        error: response.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get preferences by category'
      };
    }
  }
}
