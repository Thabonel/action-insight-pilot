
import { apiClient } from '@/lib/api-client';
import { UserPreferences, ApiResponse } from '@/lib/api-client-interface';

export class UserPreferencesService {
  async getUserPreferences(category?: string): Promise<ApiResponse<UserPreferences>> {
    try {
      const result = await apiClient.userPreferences.getUserPreferences(category);
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
      const result = await apiClient.userPreferences.updateUserPreferences(category, data);
      return result;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update preferences'
      };
    }
  }

  // Add missing methods that components are expecting
  async getGeneralPreferences(): Promise<ApiResponse<UserPreferences>> {
    return this.getUserPreferences('general');
  }

  async updateGeneralPreferences(data: Partial<UserPreferences>): Promise<ApiResponse<UserPreferences>> {
    return this.updateUserPreferences('general', data);
  }

  async resetPreferences(): Promise<ApiResponse<void>> {
    try {
      const defaultPrefs: UserPreferences = {
        theme: 'light',
        notifications: true,
        language: 'en',
        timezone: 'UTC'
      };
      
      await apiClient.userPreferences.update('general', defaultPrefs);
      
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
      const result = await apiClient.userPreferences.get();
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
