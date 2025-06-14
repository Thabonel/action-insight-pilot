
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

export class HttpClient {
  private baseUrl = 'https://wheels-wins-orchestrator.onrender.com';
  private token: string | null = null;
  private timeout = 30000; // 30 seconds timeout
  private wakeUpTimeout = 60000; // 60 seconds for wake-up calls

  setToken(token: string) {
    this.token = token;
    console.log('HTTP Client token set:', token ? 'Token provided' : 'No token');
  }

  async wakeUpServer(): Promise<ApiResponse<any>> {
    try {
      console.log('Waking up backend server...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.wakeUpTimeout);

      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(`Server wake-up response: ${response.status}`);

      if (response.ok) {
        return { success: true, data: { message: 'Server is awake' } };
      } else {
        return { success: false, error: 'Server wake-up failed' };
      }
    } catch (error) {
      console.error('Server wake-up error:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        return { success: false, error: 'Server wake-up timeout - server may still be starting' };
      }
      return { success: false, error: 'Failed to wake up server' };
    }
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const headers = {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      };

      console.log(`API Request: ${options.method || 'GET'} ${url}`);

      // Add timeout to fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log(`API Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        // Handle specific HTTP errors
        if (response.status === 0 || response.status >= 500) {
          return {
            success: false,
            error: 'Backend server is unavailable. Please try again later.',
          };
        }
        
        if (response.status === 404) {
          return {
            success: false,
            error: 'API endpoint not found.',
          };
        }

        if (response.status === 401) {
          return {
            success: false,
            error: 'Authentication required. Please log in again.',
          };
        }

        if (response.status === 403) {
          return {
            success: false,
            error: 'Access denied. You do not have permission to perform this action.',
          };
        }

        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.detail || errorMessage;
        } catch {
          // Use default error message if JSON parsing fails
        }

        return {
          success: false,
          error: errorMessage,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API Request failed:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request timeout - backend server may be down',
          };
        }
        
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          return {
            success: false,
            error: 'Unable to connect to backend server. Please check your internet connection.',
          };
        }
        
        return {
          success: false,
          error: `Network error: ${error.message}`,
        };
      }
      
      return {
        success: false,
        error: 'Unknown network error occurred',
      };
    }
  }
}
