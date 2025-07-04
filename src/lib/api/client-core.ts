
import { HttpClient } from '../http-client';
import { ApiResponse } from './api-client-interface';

export class ClientCore {
  public httpClient: HttpClient;

  constructor() {
    this.httpClient = new HttpClient();
  }

  setToken(token: string) {
    this.httpClient.setToken(token);
  }
}
