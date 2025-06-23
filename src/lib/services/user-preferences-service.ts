
import { apiClient } from '@/lib/api-client';
import { ApiResponse, UserPreferences } from '@/lib/api-client-interface';

export class UserPreferencesService {
  async getUserPreferences(category?: string): Promise<ApiResponse<UserPreferences>> {
    try {
      const userPrefMethods = await apiClient.userPreferences();
      return await userPrefMethods.getUserPreferences(category);
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get preferences'
      };
    }
  }

  async updateUserPreferences(category: string, data: Partial<UserPreferences>): Promise<ApiResponse<UserPreferences>> {
    try {
      const userPrefMethods = await apiClient.userPreferences();
      return await userPrefMethods.updateUserPreferences(category, data);
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update preferences'
      };
    }
  }

  async getGeneralPreferences(): Promise<ApiResponse<UserPreferences>> {
    try {
      const userPrefMethods = await apiClient.userPreferences();
      return await userPrefMethods.get();
    } catch (error) {
      console.error('Error getting general preferences:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get general preferences'
      };
    }
  }

  async updateGeneralPreferences(data: Partial<UserPreferences>): Promise<ApiResponse<UserPreferences>> {
    try {
      const userPrefMethods = await apiClient.userPreferences();
      return await userPrefMethods.update(data);
    } catch (error) {
      console.error('Error updating general preferences:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update general preferences'
      };
    }
  }
}

export const userPreferencesService = new UserPreferencesService();

