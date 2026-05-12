import { test, expect } from '@playwright/test';
import { ApiConfig } from '../../../config/api-config';
import { TestData } from '../../../config/test-data';
import { ApiClient } from '../../../fixtures/api-client';

// Password reset Link 

test('Verify forgot password link functionality', async ({ request }) => {
    const apiClient = new ApiClient(request);
  
    const loginUrl = ApiConfig.buildUrl(
      ApiConfig.endpoints.forgot_password.forgotRequest
    );
  
    const response = await apiClient.post(loginUrl, {
      email: TestData.credentials.userEmail,
    });
  
    const responseBody = await response.json();
  
    console.log('Response Body:', responseBody);
  
    expect(response.status()).toBe(200);
  
    expect(responseBody.success).toBe(true);
  
    expect(responseBody.message.title)
      .toBe('A password reset link has been sent to your email.');
  });