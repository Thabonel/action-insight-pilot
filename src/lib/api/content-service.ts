
import { HttpClient } from '../http-client';

export interface ContentBrief {
  title: string;
  content_type: string;
  target_audience: string;
  key_messages: string[];
  platform: string;
  tone?: string;
  length?: string;
  keywords?: string[];
  cta?: string;
}

export interface ContentData {
  [key: string]: unknown;
}

export class ContentService {
  constructor(private httpClient: HttpClient) {}

  async generateContent(brief: ContentBrief) {
    return this.httpClient.request('/api/content/generate', {
      method: 'POST',
      body: JSON.stringify(brief),
    });
  }

  async createContent(contentData: ContentData) {
    return this.httpClient.request('/api/content/create', {
      method: 'POST',
      body: JSON.stringify(contentData),
    });
  }

  async getContentLibrary() {
    return this.httpClient.request('/api/content/library');
  }
}
