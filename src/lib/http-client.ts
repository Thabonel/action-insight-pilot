
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

export class HttpClient {
  private baseUrl = 'https://srv-d0sjalqli9vc73d20vqg.onrender.com';
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
      console.log('Request headers:', headers);

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
        const errorText = await response.text();
        console.error(`API Error: ${response.status}`, errorText);
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
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
