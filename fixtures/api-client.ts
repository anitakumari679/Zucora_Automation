import { APIRequestContext, expect } from '@playwright/test';

export class ApiClient {
  constructor(private request: APIRequestContext) {}

  async post(url: string, payload: object) {
    return await this.request.post(url, {
      data: payload,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

