const { test, expect } = require('@playwright/test');
const PageObjectManager = require('../pageObjects/pageObjectManager');
const testData = require('./testData');
const Assertions = require('../utils/assertions');

let loginPage;
let pageObjectManager;
let assertions;


test.describe('Login Page Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    pageObjectManager = new PageObjectManager(page);
    loginPage = pageObjectManager.loginPage;
    assertions = new Assertions(page);
    await loginPage.launchUrl(process.env.BASE_URL);
  });

  test.describe('Invalid Credential Tests', () => {
    test('@smoke @ui @regression TC001 - Invalid Email & Valid Password', async () => {
      await loginPage.login(testData.invalidEmail, process.env.PASSWORD);
      await assertions.assertElementContainsText(loginPage.locators.loginErrorMessage,testData.invalidCredentialsMessage);
    });

    test('@ui TC002 - Valid Email & Invalid Password', async () => {
      await loginPage.login(process.env.USEREMAIL, testData.invalidPassword);
      await assertions.assertElementContainsText(loginPage.locators.loginErrorMessage,testData.invalidCredentialsMessage);
    });

    test('@ui TC003 - Invalid Email & Invalid Password', async () => {
      await loginPage.login(testData.invalidEmail, testData.invalidPassword);
      await assertions.assertElementContainsText(loginPage.locators.loginErrorMessage,testData.invalidCredentialsMessage);
    });
  });

  test.describe('Blank Fields Validation', () => {
    test('@ui TC004 - Blank Email and Password', async () => {
      await loginPage.login(); 
      await loginPage.verifyBlankFieldsErrorMessage(testData.blankFieldsMessage);
    });
  });

  test('TC005 - Valid Credentials Login', async () => {
    await loginPage.login(process.env.USEREMAIL, process.env.PASSWORD);
    await assertions.assertUrlContains('dashboard');
  });

  test('TC006 - Password Visibility Toggle', async () => {
    await loginPage.togglePasswordVisibility(process.env.PASSWORD);
    await expect(loginPage.locators.passwordInput).toHaveAttribute('type', 'text');
  });
  
});
