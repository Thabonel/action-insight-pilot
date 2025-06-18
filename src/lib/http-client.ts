
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

export class HttpClient {
  private baseUrl = 'https://wheels-wins-orchestrator.onrender.com';
  private token: string | null = null;
  private timeout = 30000; // 30 seconds timeout

  setToken(token: string) {
    this.token = token;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const headers = {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      };

      // Add timeout to fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Handle specific HTTP errors
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

        if (response.status >= 500) {
          return {
            success: false,
            error: 'Server error. Please try again later.',
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
            error: 'Request timeout. Please try again.',
          };
        }
        
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          return {
            success: false,
            error: 'Unable to connect to server. Please check your internet connection.',
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
