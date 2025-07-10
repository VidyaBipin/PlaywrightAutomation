const LoginPage = require('../pages/loginPage'); // Ensure the file path is correct and class name is PascalCase

class PageObjectManager {
  constructor(page) {
    this.page = page;
    this.loginPage = new LoginPage(this.page); // Correct class name
  }
}

module.exports = PageObjectManager;