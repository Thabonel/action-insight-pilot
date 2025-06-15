
import { BaseApiClient } from './base-api-client';
import { ContentService } from './content-service';

export class ContentMethods extends BaseApiClient {
  private content: ContentService;

  constructor() {
    super();
    this.content = new ContentService(this.httpClient);
  }

  async generateContent(brief: any) {
    return this.content.generateContent(brief);
  }

  async createContent(contentData: any) {
    return this.content.createContent(contentData);
  }

  async getContentLibrary() {
    return this.content.getContentLibrary();
  }
}
