import { faker } from '@faker-js/faker';
import { test, expect, bearerAuthHeaders } from '../../../fixtures/login';
import { ApiClient } from '../../../fixtures/api-client';
import { ApiConfig } from '../../../config/api-config';
import { time } from 'console';

const ONBOARDING_ROLE_ID = '41ecd110-c92e-4ac7-9a68-9cceff63ac77';

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

test.describe('User onboarding', () => {
  test('POST /user/onboarding creates 100 users', async ({
    request,
    accessToken,
  }) => {

    const api = new ApiClient(request);

    for (let i = 1; i <= 100; i++) {

      const email = `anita.kumari+${faker.string.alphanumeric(10).toLowerCase()}@techindustan.com`;

      const payload = {
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email,
        status: 'PENDING' as const,
        roles: [ONBOARDING_ROLE_ID],
        custom_permissions: [] as string[],
      };

      console.log(`\nCreating User ${i}`);
      console.log('Payload:', payload);

      const response = await api.post(
        ApiConfig.buildUrl(ApiConfig.endpoints.onboarding.userOnboarding),
        payload,
        bearerAuthHeaders(accessToken)
      );

      const body = await response.json();

      console.log(`Response Status for User ${i}:`, response.status());

      expect(
        response.ok(),
        `Onboarding failed for ${email}: ${response.status()} ${JSON.stringify(body)}`
      ).toBe(true);

      expect(response.status()).toBe(201);
      expect(body.success).toBe(true);
      expect(body.message.title).toBe('Invitation Email Sent');
      expect(body.message.description).toBe(
        'An invitation email was successfully sent.'      
      );

      expect(body.info).toBeDefined();
      expect(body.info.first_name).toBe(payload.first_name);
      expect(body.info.last_name).toBe(payload.last_name);
      expect(body.info.email).toBe(payload.email);
      expect(body.info.status).toBe('PENDING');

      console.log(`User ${i} created successfully: ${email}`);
      await sleep(1000);
    }
  });
});