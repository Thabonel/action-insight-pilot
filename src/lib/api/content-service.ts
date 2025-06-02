
import { HttpClient } from '../http-client';

export class ContentService {
  constructor(private httpClient: HttpClient) {}

  async createContent(contentData: any) {
    return this.httpClient.request('/api/content/create', {
      method: 'POST',
      body: JSON.stringify(contentData),
    });
  }

  async getContentLibrary() {
    return this.httpClient.request('/api/content/library');
  }
}
