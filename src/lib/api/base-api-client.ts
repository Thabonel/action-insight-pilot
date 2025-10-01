
export class BaseApiClient {
  protected httpClient: any;

  constructor() {
    // No HTTP client - use Supabase directly
    this.httpClient = null;
  }

  setToken(token: string) {
    // No-op - use Supabase auth instead
  }
}
