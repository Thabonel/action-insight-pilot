
import { apiClient } from '@/lib/api-client';
import { ApiResponse } from '@/lib/api-client-interface';

// Define UserPreferences type to match the expected interface
export interface UserPreferences {
  [key: string]: any;
}

export class UserPreferencesService {
  static async getUserPreferences(category: string): Promise<ApiResponse<UserPreferences>> {
    try {
      const response = await apiClient.userPreferences.getUserPreferences(category);
      
      if (response.success && response.data && response.data.length > 0) {
        // Extract preference_data from the first result
        const preferences = response.data[0].preference_data || {};
        return {
          success: true,
          data: preferences as UserPreferences
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
        data: preferences,
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
      const response = await apiClient.userPreferences.get();
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
