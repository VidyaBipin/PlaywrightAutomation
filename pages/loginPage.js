const { expect } = require('@playwright/test');
const LoginPageObjects = require('../pageObjects/loginPageObjects');
const ActionHelpers = require('../utils/actionHelpers');


class LoginPage {
  constructor(page) {
    this.page = page;
    this.actionHelpers = new ActionHelpers(page);
    this.locators = new LoginPageObjects(page);
  }

  async launchUrl(url) {
    await this.page.goto(url, {
      waitUntil: 'networkidle',
    });
  }

  async login(email='', password = '') {
    await this.actionHelpers.waitAndFillData(this.locators.emailInput, email);
    await this.actionHelpers.waitAndFillData(this.locators.passwordInput, password);
    await this.locators.loginButton.click();
  }

  async verifyInvalidLoginErrorMessage(invalidCredentialsMessage) {
    await this.locators.errorMessage.waitFor({ state: 'visible' });
    const errorMessage = await this.locators.errorMessage.textContent();
    return errorMessage.includes(invalidCredentialsMessage);
  }


 async verifyBlankFieldsErrorMessage(blankFieldsMessage) {
   await this.locators.loginButton.click();
   const errorLocator = this.page.getByText(blankFieldsMessage);
   await expect(errorLocator).toBeVisible();
   await expect(errorLocator).toHaveText(blankFieldsMessage);
  }

  async togglePasswordVisibility(password) {
    await this.actionHelpers.waitAndFillData(this.locators.passwordInput, password);
    await expect(this.locators.passwordInput).toHaveAttribute('type', 'password');
    await this.locators.passwordToggleBtn.click();
    await expect(this.locators.passwordInput).toHaveAttribute('type', 'text');
    await expect(this.locators.passwordInput).toHaveValue(password);
  }





 
}

module.exports = LoginPage;