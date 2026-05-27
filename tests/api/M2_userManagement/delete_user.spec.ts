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

    // Generate unique email
    const email = `anita.kumari+${faker.string
      .alphanumeric(10)
      .toLowerCase()}@techindustan.com`;

    const payload = {
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email,
      status: 'PENDING' as const,
      roles: [ONBOARDING_ROLE_ID],
      custom_permissions: [] as string[],
    };

    console.log('Created user data is:', payload);

    // Create User
    const response = await api.post(
      ApiConfig.buildUrl(
        ApiConfig.endpoints.onboarding.userOnboarding
      ),
      payload,
      bearerAuthHeaders(accessToken)
    );

    const body = await response.json();

    expect(
      response.ok(),
      `Onboarding failed: ${response.status()} ${JSON.stringify(body)}`
    ).toBe(true);

    expect(response.status()).toBe(201);

    // Response validations
    expect(body.success).toBe(true);

    expect(body.message.title).toBe(
      'Invitation Email Sent'
    );

    expect(body.message.description).toBe(
      'An invitation email was successfully sent.'
    );

    expect(body.info).toBeDefined();

    expect(body.info.first_name).toBe(payload.first_name);
    expect(body.info.last_name).toBe(payload.last_name);
    expect(body.info.email).toBe(payload.email);

    expect(body.info.status).toBe('PENDING');

    expect(body.info.id).toBeTruthy();
    expect(body.info.created_at).toBeTruthy();
    expect(body.info.updated_at).toBeTruthy();

    // Store created user ID
    const userId = body.info.id as string;

    console.log('Created User ID:', userId);

    // Delete user
    const deleteResponse = await api.delete(
        ApiConfig.buildUrl(
          `${ApiConfig.endpoints.onboarding.deleteUser}/${userId}`
        ),
        {},
        bearerAuthHeaders(accessToken)
      );

    const deleteBody = await deleteResponse.json();

    // Delete validations
    expect(
      deleteResponse.ok(),
      `Delete failed: ${deleteResponse.status()} ${JSON.stringify(deleteBody)}`
    ).toBe(true);

    expect(deleteResponse.status()).toBe(200);

    expect(deleteBody.success).toBe(true);
    console.log('User deleted successfully')
  });
});