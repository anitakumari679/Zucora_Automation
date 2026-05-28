import { Page, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { ZucoraUILocators } from '../config/locators';
import { TestData } from '../config/test-data';

export class ForgotPasswordPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigateToForgotPasswordPage(): Promise<void> {
    await this.navigateTo(TestData.forgotPassword.url);
    await this.waitForPageLoad();
  }
}