
import { apiClient } from '@/lib/api-client';
import { UserPreferences, ApiResponse } from '@/lib/api-client-interface';

export class UserPreferencesService {
  async getUserPreferences(category?: string): Promise<ApiResponse<UserPreferences>> {
    try {
      const userPrefs = apiClient.userPreferences;
      const result = await userPrefs.getUserPreferences(category);
      return result;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch preferences'
      };
    }
  }

  async updateUserPreferences(category: string, data: Partial<UserPreferences>): Promise<ApiResponse<UserPreferences>> {
    try {
      const userPrefs = apiClient.userPreferences;
      const result = await userPrefs.updateUserPreferences(category, data);
      return result;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update preferences'
      };
    }
  }

  async resetPreferences(): Promise<ApiResponse<void>> {
    try {
      // Reset to default preferences
      const defaultPrefs: UserPreferences = {
        theme: 'light',
        notifications: true,
        language: 'en',
        timezone: 'UTC'
      };
      
      const userPrefs = apiClient.userPreferences;
      await userPrefs.update(defaultPrefs);
      
      return {
        success: true,
        data: undefined
      };
    } catch (error) {
      console.error('Error resetting preferences:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reset preferences'
      };
    }
  }

  async getPreferences(): Promise<ApiResponse<UserPreferences>> {
    try {
      const userPrefs = apiClient.userPreferences;
      const result = await userPrefs.get();
      return result;
    } catch (error) {
      console.error('Error getting preferences:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get preferences'
      };
    }
  }
}

export const userPreferencesService = new UserPreferencesService();
