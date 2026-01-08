
import { ClientCore } from './client-core';
import { ContentMethods } from './content-methods';
import { ContentBrief } from './content-service';

export interface ContentData {
  [key: string]: unknown;
}

export class ContentApi extends ClientCore {
  private contentMethods: ContentMethods;

  constructor() {
    super();
    this.contentMethods = new ContentMethods();
  }

  setToken(token: string) {
    super.setToken(token);
    this.contentMethods.setToken(token);
  }

  async generateContent(brief: ContentBrief) {
    return this.contentMethods.generateContent(brief);
  }

  async createContent(contentData: ContentData) {
    return this.contentMethods.createContent(contentData);
  }

  async getContentLibrary() {
    return this.contentMethods.getContentLibrary();
  }
}
