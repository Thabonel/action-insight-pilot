
export class BaseApiClient {
  protected httpClient: any;

  constructor() {
    // Mock HTTP client for now
    this.httpClient = {
      get: async (url: string) => ({ data: null, status: 200 }),
      post: async (url: string, data: any) => ({ data: null, status: 200 }),
      put: async (url: string, data: any) => ({ data: null, status: 200 }),
      delete: async (url: string) => ({ data: null, status: 200 }),
    };
  }

  setToken(token: string) {
    // Mock implementation
    console.log('Token set:', token ? 'Token provided' : 'Token cleared');
  }
}
