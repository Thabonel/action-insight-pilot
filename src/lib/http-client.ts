export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

export class HttpClient {
  private baseUrl: string;
  private token: string | null = null;
  private apiKey: string;
  private timeout = 30000; // 30 seconds timeout

  constructor(baseUrl: string = 'https://wheels-wins-orchestrator.onrender.com') {
    this.baseUrl = baseUrl;
    // Try multiple possible environment variable names
    this.apiKey = import.meta.env.VITE_SUPABASE_KEY || 
                 import.meta.env.SUPABASE_KEY || 
                 import.meta.env.VITE_SUPABASE_ANON_KEY || 
                 '';
    
    if (!this.apiKey) {
      console.warn('No Supabase API key found in environment variables');
      console.log('Available env vars:', Object.keys(import.meta.env));
    } else {
      console.log('✅ Supabase API key found');
    }
  }

  setToken(token: string) {
    this.token = token;
    console.log('HTTP Client token updated:', token ? 'Token provided' : 'No token');
  }

  async get<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const headers = {
        'Content-Type': 'application/json',
        'apikey': this.apiKey,
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options.headers,
      };

      console.log('Making request with headers:', { 
        hasApiKey: !!this.apiKey, 
        hasToken: !!this.token,
        url,
        apiKeyLength: this.apiKey ? this.apiKey.length : 0
      });

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
      
      if (error instanceof Er