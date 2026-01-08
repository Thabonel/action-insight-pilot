
import { BaseApiClient } from './base-api-client';
import { ContentService, ContentBrief } from './content-service';

export interface ContentData {
  [key: string]: unknown;
}

export class ContentMethods extends BaseApiClient {
  private content: ContentService;

  constructor() {
    super();
    this.content = new ContentService(this.httpClient);
  }

  async generateContent(brief: ContentBrief) {
    return this.content.generateContent(brief);
  }

  async createContent(contentData: ContentData) {
    return this.content.createContent(contentData);
  }

  async getContentLibrary() {
    return this.content.getContentLibrary();
  }
}
