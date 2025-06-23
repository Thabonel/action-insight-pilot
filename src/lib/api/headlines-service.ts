
import { HttpClient } from '../http-client';

export class HeadlinesService {
  constructor(private httpClient: HttpClient) {}

  async generateHeadlines(topic: string, count: number = 5) {
    return this.httpClient.request('/api/headlines/generate', {
      method: 'POST',
      body: JSON.stringify({ topic, count }),
    });
  }

  async analyzeHeadline(headline: string) {
    return this.httpClient.request('/api/headlines/analyze', {
      method: 'POST',
      body: JSON.stringify({ headline }),
    });
  }
}
