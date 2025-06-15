
import { ClientCore } from './client-core';
import { SocialMethods } from './social-methods';

export class SocialApi extends ClientCore {
  private socialMethods: SocialMethods;

  constructor() {
    super();
    this.socialMethods = new SocialMethods();
  }

  setToken(token: string) {
    super.setToken(token);
    this.socialMethods.setToken(token);
  }

  async getSocialMediaPosts() {
    return this.socialMethods.getSocialMediaPosts();
  }

  async createSocialPost(postData: any) {
    return this.socialMethods.createSocialPost(postData);
  }

  async getSocialAnalytics() {
    return this.socialMethods.getSocialAnalytics();
  }

  async scheduleSocialPost(postData: any) {
    return this.socialMethods.scheduleSocialPost(postData);
  }

  async generateSocialContent(platform: string, contentTheme: string, brandVoice?: string) {
    return this.socialMethods.generateSocialContent(platform, contentTheme, brandVoice);
  }
}
