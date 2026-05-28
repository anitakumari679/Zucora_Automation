import { faker } from '@faker-js/faker';
import { testWithWorkerAuth as test, expect } from '../../../fixtures/login';
import {
  bearerAuthHeaders,
} from '../../../fixtures/login';
import { ApiClient } from '../../../fixtures/api-client';
import { ApiConfig } from '../../../config/api-config';
import { TestData } from '../../../config/test-data';

const ONBOARDING_ROLE_ID = TestData.roleId.adminRoleId;

test.describe('User onboarding / Create User', () => {
  test('POST /user/onboarding creates user with PENDING status', async ({
    authRequest,
    accessToken,
  }) => {
    const api = new ApiClient(authRequest);

    const email = `anita.kumari+${faker.string.alphanumeric(10).toLowerCase()}@techindustan.com`;
    const payload = {
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email,
      status: 'PENDING' as const,
      roles: [ONBOARDING_ROLE_ID],
      custom_permissions: [] as string[],
    };
    console.log('Created user data is : ', payload);

    const response = await api.post(
      ApiConfig.buildUrl(ApiConfig.endpoints.onboarding.userOnboarding),
      payload,
      bearerAuthHeaders(accessToken)
    );
    const body = await response.json();
    expect(
      response.ok(),
      `Onboarding failed: ${response.status()} ${JSON.stringify(body)}`
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
    expect(body.info.id).toBeTruthy();
    expect(body.info.created_at).toBeTruthy();
    expect(body.info.updated_at).toBeTruthy();

  });

  test('GET /role/permissions', async ({ authRequest, accessToken }) => {
    const api = new ApiClient(authRequest);
    const response = await api.get(
      ApiConfig.buildUrl(ApiConfig.endpoints.role.rolePermissions),
      bearerAuthHeaders(accessToken)
    );
    const body = await response.json();
    expect(
      response.ok(),
      `Role permissions failed: ${response.status()} ${JSON.stringify(body)}`
    ).toBe(true);
    expect(body.success).toBe(true);
    expect(response.status()).toBe(200);
  });

  test('GET /role', async ({ authRequest, accessToken }) => {
    const api = new ApiClient(authRequest);
    const response = await api.get(
      ApiConfig.buildUrl(ApiConfig.endpoints.role.getRole),
      bearerAuthHeaders(accessToken)
    );
    const body = await response.json();
    expect(
      response.ok(),
      `Get role failed: ${response.status()} ${JSON.stringify(body)}`
    ).toBe(true);
    expect(body.success).toBe(true);
    expect(response.status()).toBe(200);
  });

  test('GET /user list', async ({ authRequest, accessToken }) => {
    const api = new ApiClient(authRequest);
    const response = await api.get(
      ApiConfig.buildUrl(ApiConfig.endpoints.userList.getUserListAndDetail),
      bearerAuthHeaders(accessToken)
    );
    const body = await response.json();
    expect(
      response.ok(),
      `User list failed: ${response.status()} ${JSON.stringify(body)}`
    ).toBe(true);
    expect(body.success).toBe(true);
    expect(response.status()).toBe(200);
  });

  test('Get /User/Id details', async ({
    authRequest,
    accessToken,
  }) => {
    const api = new ApiClient(authRequest);
  
    // Generate unique email
    const email = `anita.kumari+${faker.string
      .alphanumeric(10)
      .toLowerCase()}@techindustan.com`;
    const first_name = faker.person.firstName();
    const last_name = faker.person.lastName();
  
    // Create payload
    const payload = {
      first_name,
      last_name,
      email,
      status: 'PENDING' as const,
      roles: [ONBOARDING_ROLE_ID],
      custom_permissions: [] as string[],
    };
  
    console.log('Created user payload:', payload);
  
    // Step 1: Create User
    const createRes = await api.post(
      ApiConfig.buildUrl(ApiConfig.endpoints.onboarding.userOnboarding),
      payload,
      bearerAuthHeaders(accessToken)
    );
  
    const createBody = await createRes.json();
  
    expect(
      createRes.ok(),
      `User creation failed: ${createRes.status()} ${JSON.stringify(createBody)}`
    ).toBe(true);
  
    expect(createRes.status()).toBe(201);
    expect(createBody.success).toBe(true);
    expect(createBody.message.title).toBe('Invitation Email Sent');
  
    // Get created user id
    const userId = createBody.info.id
  
    console.log('Created User ID:', userId);
  
    // Step 2: Get User Details
    const getUserRes = await api.get(
      `${ApiConfig.buildUrl(
        ApiConfig.endpoints.userList.getUserListAndDetail
      )}/${userId}`,
      bearerAuthHeaders(accessToken)
    );
  
    const getUserBody = await getUserRes.json();
  
    expect(
      getUserRes.ok(),
      `Get user failed: ${getUserRes.status()} ${JSON.stringify(getUserBody)}`
    ).toBe(true);
  
    expect(getUserRes.status()).toBe(200);
    expect(getUserBody.success).toBe(true);
    expect(getUserBody.message.title).toBe('User Details Shown Successfully');
    expect(getUserBody.message.description).toBe(
      'The requested user details have been fetched.'
    );

    expect(getUserBody.info).toBeDefined();
    expect(getUserBody.info.is_super_admin).toBe(false);
    expect(getUserBody.info.roles).toEqual([ONBOARDING_ROLE_ID]);
    expect(getUserBody.info.custom_permissions).toEqual([]);
    const user = getUserBody.info.user;
    expect(user).toBeDefined();
    expect(user.id).toBe(userId);
    expect(user.first_name).toBe(payload.first_name);
    expect(user.last_name).toBe(payload.last_name);
    expect(user.email).toBe(payload.email);
    expect(user.status).toBe('PENDING');
    expect(user.availability).toBe('OFF_DUTY');
  });
}); 
