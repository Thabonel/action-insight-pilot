
import { HttpClient } from '../http-client';

export class SocialService {
  constructor(private httpClient: HttpClient) {}

  async getSocialMediaPosts() {
    return this.httpClient.request('/api/social/posts');
  }

  async createSocialPost(postData: Record<string, unknown>) {
    return this.httpClient.request('/api/social/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async getSocialAnalytics() {
    return this.httpClient.request('/api/social/analytics');
  }

  async scheduleSocialPost(postData: Record<string, unknown>) {
    return this.httpClient.request('/api/social/schedule', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }
}
