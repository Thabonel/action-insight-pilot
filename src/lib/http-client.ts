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
    console.log('HTTP Client token set:', token ? 'Token provided' : 'No token');
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
