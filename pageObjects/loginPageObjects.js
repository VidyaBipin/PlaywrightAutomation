class LoginPageObjects {
  constructor(page) {
    this.page = page;
    this.emailInput = this.page.locator("input[placeholder='Enter your email']");
    this.passwordInput = this.page.locator("input[placeholder='Enter a password']");
    this.rememberMeCheckbox =this.page.locator('input[type="checkbox"]');
    this.loginButton = this.page.locator('button:has-text("Login")');
    this.loginErrorMessage = this.page.locator('.text-error.text-sm');
    this.blankFieldsError =this.page.locator('.text-xs.font-medium.text-error-700');
    this.passwordToggleBtn = this.page.locator('.h-5.w-5.text-gray-500');
  }
}
module.exports =  LoginPageObjects ;