import { test, expect, bearerAuthHeaders } from '../../../fixtures/login';
import { ApiClient } from '../../../fixtures/api-client';
import { ApiConfig } from '../../../config/api-config';

test.describe('User onboarding', () => {
  test('GET/ Role list', async ({
    request,
    accessToken,
  }) => {
    const api = new ApiClient(request);
    const response = await api.get(
      ApiConfig.buildUrl(ApiConfig.endpoints.role.getRole),
      bearerAuthHeaders(accessToken)
    );
    const body = await response.json();
    expect(
      response.ok(),
      `onboarding failed: ${response.status()} ${JSON.stringify(body)}`
    ).toBe(true);
    expect(body.success).toBe(true);
    expect(response.status()).toBe(200);
    console.log(response)
  });
});

