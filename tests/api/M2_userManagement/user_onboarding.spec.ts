import { faker } from '@faker-js/faker';
import { test, expect, bearerAuthHeaders } from '../../../fixtures/login';
import { ApiClient } from '../../../fixtures/api-client';
import { ApiConfig } from '../../../config/api-config';

const ONBOARDING_ROLE_ID = '41ecd110-c92e-4ac7-9a68-9cceff63ac77';

test.describe('User onboarding', () => {
  test('POST /user/onboarding creates user with PENDING status', async ({
    request,
    accessToken,
  }) => {
    const api = new ApiClient(request);

    const email = `anita.kumari+${faker.string.alphanumeric(10).toLowerCase()}@techindustan.com`;
    const payload = {
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email,
      status: 'PENDING' as const,
      roles: [ONBOARDING_ROLE_ID],
      custom_permissions: [] as string[],
    };
    console.log("Created user data is : ",payload);

    const response = await api.post(
      ApiConfig.buildUrl(ApiConfig.endpoints.onboarding.userOnboarding),
      payload,
      bearerAuthHeaders(accessToken)
    );
    const body = await response.json();
    expect(
      response.ok(),
      `onboarding failed: ${response.status()} ${JSON.stringify(body)}`
    ).toBe(true);
    expect(body.success).toBe(true);
    expect(body.status).toBe(201);
  });
});

