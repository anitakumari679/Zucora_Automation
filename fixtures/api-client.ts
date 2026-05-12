import { APIRequestContext } from '@playwright/test';

const jsonHeaders = {
  'Content-Type': 'application/json',
};

export class ApiClient {
  constructor(private request: APIRequestContext) {}

  async get(url: string, headers: Record<string, string> = {}) {
    return await this.request.get(url, { headers });
  }

  async post(url: string, payload: object, headers: Record<string, string> = {}) {
    return await this.request.post(url, {
      data: payload,
      headers: { ...jsonHeaders, ...headers },
    });
  }
}

