const { expect } = require('@playwright/test');

/**
 * Assertion helper methods for Playwright tests.
 */
class Assertions {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  async assertElementHasText(element, expectedText) {
    await expect(element, `Expected element to have text: "${expectedText}"`).toHaveText(expectedText);
  }

  async assertElementContainsText(element, expectedText) {
    await expect(element, `Expected element to contain text: "${expectedText}"`).toContainText(expectedText);
  }

  async assertElementHasValue(element, expectedValue) {
    await expect(element, `Expected element to have value: "${expectedValue}"`).toHaveValue(expectedValue);
  }

  async assertElementHasAttribute(element, attributeName, attributeValue) {
    await expect(element, `Expected element to have attribute "${attributeName}"="${attributeValue}"`).toHaveAttribute(attributeName, attributeValue);
  }

  async assertElementCount(elements, expectedCount) {
    await expect(elements, `Expected element count: ${expectedCount}`).toHaveCount(expectedCount);
  }

  async assertUrlContains(expectedUrlPart) {
    await expect(this.page, `Expected URL to contain: "${expectedUrlPart}"`).toHaveURL(new RegExp(expectedUrlPart));
  }

  async assertUrlIs(expectedUrl) {
    await expect(this.page, `Expected URL to be: "${expectedUrl}"`).toHaveURL(expectedUrl);
  }

  async assertTitleIs(expectedTitle) {
    await expect(this.page, `Expected title to be: "${expectedTitle}"`).toHaveTitle(expectedTitle);
  }

  async assertTitleContains(expectedTitlePart) {
    const title = await this.page.title();
    expect(title, `Expected title to contain: "${expectedTitlePart}"`).toContain(expectedTitlePart);
  }

  async assertElementCountGreaterThan(elements, minCount) {
    const count = await elements.count();
    expect(count, `Expected element count to be greater than ${minCount}, got ${count}`).toBeGreaterThan(minCount);
  }

  async assertElementCountLessThan(elements, maxCount) {
    const count = await elements.count();
    expect(count, `Expected element count to be less than ${maxCount}, got ${count}`).toBeLessThan(maxCount);
  }

  async assertElementHasClass(element, className) {
    const classes = await element.getAttribute('class');
    expect(classes, `Expected element to have class: "${className}"`).toContain(className);
  }

  async assertElementDoesNotHaveClass(element, className) {
    const classes = await element.getAttribute('class');
    expect(classes, `Expected element NOT to have class: "${className}"`).not.toContain(className);
  }

  async assertElementHasCSSProperty(element, propertyName, expectedValue) {
    const value = await element.evaluate(
      (el, prop) => window.getComputedStyle(el).getPropertyValue(prop),
      propertyName
    );
    expect(value.trim(), `Expected CSS property "${propertyName}" to be "${expectedValue}", got "${value.trim()}"`).toBe(expectedValue);
  }
}

module.exports = Assertions;