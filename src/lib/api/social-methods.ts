
import { BaseApiClient } from './base-api-client';
import { SocialService } from './social-service';
import { EnhancedSocialService } from './enhanced-social-service';

export class SocialMethods extends BaseApiClient {
  private social: SocialService;
  private enhancedSocial: EnhancedSocialService;

  constructor() {
    super();
    this.social = new SocialService(this.httpClient);
    this.enhancedSocial = new EnhancedSocialService(this.httpClient);
  }

  async getSocialMediaPosts() {
    return this.social.getSocialMediaPosts();
  }

  async createSocialPost(postData: any) {
    return this.social.createSocialPost(postData);
  }

  async getSocialAnalytics() {
    return this.social.getSocialAnalytics();
  }

  async scheduleSocialPost(postData: any) {
    return this.social.scheduleSocialPost(postData);
  }

  async generateSocialContent(platform: string, contentTheme: string, brandVoice?: string) {
    return this.enhancedSocial.generateAIContent({
      topic: contentTheme,
      platform,
      tone: brandVoice
    });
  }
}
