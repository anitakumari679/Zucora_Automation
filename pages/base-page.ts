import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly defaultTimeout: number = 30000;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateTo(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'networkidle' });
  }

  async click(locator: string): Promise<void> {
    await this.page.locator(locator).first().click({ timeout: this.defaultTimeout });
  }

  async clickWithRetry(locator: string, retries: number = 3): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        await this.page.locator(locator).first().click({ timeout: this.defaultTimeout });
        return;
      } catch (error) {
        if (i === retries - 1) throw error;
        await this.page.waitForTimeout(1000);
      }
    }
  }

  async fill(locator: string, text: string): Promise<void> {
    const element = this.page.locator(locator).first();
    await element.waitFor({ state: 'visible', timeout: this.defaultTimeout });
    await element.clear();
    await element.fill(text);
  }

  async clearAndFill(locator: string, text: string): Promise<void> {
    const element = this.page.locator(locator).first();
    await element.waitFor({ state: 'visible', timeout: this.defaultTimeout });
    await element.clear();
    await element.fill(text);
  }

  async getText(locator: string): Promise<string> {
    const element = this.page.locator(locator).first();
    await element.waitFor({ state: 'visible', timeout: this.defaultTimeout });
    return await element.innerText();
  }

  async getAttribute(locator: string, attribute: string): Promise<string | null> {
    const element = this.page.locator(locator).first();
    await element.waitFor({ state: 'visible', timeout: this.defaultTimeout });
    return await element.getAttribute(attribute);
  }

  async isVisible(locator: string, timeout: number = 10000): Promise<boolean> {
    try {
      await this.page.locator(locator).first().waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  async isEnabled(locator: string): Promise<boolean> {
    const element = this.page.locator(locator).first();
    await element.waitFor({ state: 'visible', timeout: this.defaultTimeout });
    return await element.isEnabled();
  }

  async isChecked(locator: string): Promise<boolean> {
    const element = this.page.locator(locator).first();
    await element.waitFor({ state: 'visible', timeout: this.defaultTimeout });
    return await element.isChecked();
  }

  async waitForElement(locator: string, timeout: number = 30000): Promise<Locator> {
    const element = this.page.locator(locator).first();
    await element.waitFor({ state: 'visible', timeout });
    return element;
  }

  async waitForElementToBeHidden(locator: string, timeout: number = 30000): Promise<void> {
    await this.page.locator(locator).first().waitFor({ state: 'hidden', timeout });
  }

  async scrollToElement(locator: string): Promise<void> {
    const element = this.page.locator(locator).first();
    await element.scrollIntoViewIfNeeded();
  }

  async getPlaceholder(locator: string): Promise<string | null> {
    const element = this.page.locator(locator).first();
    await element.waitFor({ state: 'visible', timeout: this.defaultTimeout });
    return await element.getAttribute('placeholder');
  }

  async getInputValue(locator: string): Promise<string> {
    const element = this.page.locator(locator).first();
    await element.waitFor({ state: 'visible', timeout: this.defaultTimeout });
    return await element.inputValue();
  }

  async getInputType(locator: string): Promise<string | null> {
    const element = this.page.locator(locator).first();
    await element.waitFor({ state: 'visible', timeout: this.defaultTimeout });
    return await element.getAttribute('type');
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async waitForTimeout(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  async pressKey(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  async selectOption(locator: string, value: string): Promise<void> {
    await this.page.locator(locator).first().selectOption(value);
  }

  async checkCheckbox(locator: string): Promise<void> {
    const element = this.page.locator(locator).first();
    await element.waitFor({ state: 'visible', timeout: this.defaultTimeout });
    if (!(await element.isChecked())) {
      await element.click();
    }
  }

  async uncheckCheckbox(locator: string): Promise<void> {
    const element = this.page.locator(locator).first();
    await element.waitFor({ state: 'visible', timeout: this.defaultTimeout });
    if (await element.isChecked()) {
      await element.click();
    }
  }

  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `reports/screenshots/${name}.png`, fullPage: true });
  }

  async expectElementToBeVisible(locator: string): Promise<void> {
    await expect(this.page.locator(locator).first()).toBeVisible({ timeout: this.defaultTimeout });
  }

  async expectElementToContainText(locator: string, text: string): Promise<void> {
    await expect(this.page.locator(locator).first()).toContainText(text, { timeout: this.defaultTimeout });
  }

  async expectElementToHaveValue(locator: string, value: string): Promise<void> {
    await expect(this.page.locator(locator).first()).toHaveValue(value, { timeout: this.defaultTimeout });
  }

  async expectUrlToContain(urlPart: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(urlPart), { timeout: this.defaultTimeout });
  }

  async getElementCount(locator: string): Promise<number> {
    return await this.page.locator(locator).count();
  }

  async clickNthElement(locator: string, index: number): Promise<void> {
    await this.page.locator(locator).nth(index).click({ timeout: this.defaultTimeout });
  }

  async hoverElement(locator: string): Promise<void> {
    await this.page.locator(locator).first().hover();
  }

  async waitForNavigation(): Promise<void> {
    await this.page.waitForNavigation({ waitUntil: 'networkidle' });
  }

  async refreshPage(): Promise<void> {
    await this.page.reload({ waitUntil: 'networkidle' });
  }
}
