/**
 * A collection of helper methods to perform common actions using Playwright.
 */
import { error } from 'console';
import timeouts from '../configs/timeouts.json';

class ActionHelpers {

  /**
   * Initializes the ActionHelpers class with the Playwright page object.
   * @param {import('@playwright/test').Page} page - The Playwright page object.
   */
  constructor(page) {
    this.page = page;
  }

  async waitAndFillData(selector, value) {
    try {
      await this.page.locator(selector).waitFor({ state: 'visible', timeout: timeouts.waitForSelector });
      await this.page.locator(selector).fill(value);
    } catch (error) {
      console.error(`❌ Error in waitAndFillData for selector "${selector}": ${error.message}`);
      throw error;
    }
  }
  async clearAndFillData(selector, value) {
    try {
      const input = this.page.locator(selector);
      await input.waitFor({ state: 'visible', timeout: timeouts.waitForSelector });
      await input.fill('');
      await input.fill(value);
    } catch (error) {
      console.error(`❌ Error in clearAndFillData for selector "${selector}": ${error.message}`);
      throw error;
    }
  }

  async scrollToHeight(height) {
    try {
      await this.page.evaluate(h => window.scrollTo(0, h), height);
    } catch (error) {
      console.error(`❌ Error in scrollToHeight for height "${height}": ${error.message}`);
      throw error;
    }
  }

  async waitAndClick(selector) {
    try {
      const element = this.page.locator(selector);
      await element.waitFor({ state: 'visible', timeout: timeouts.waitForSelector });
      await element.click();
    } catch (error) {
      console.error(`❌ Error in waitAndClick for selector "${selector}": ${error.message}`);
      throw error;
    }
  }
  async selectDropdownByValueLocator(locator, value) {
    try {
      await locator.waitFor({ state: 'visible', timeout: timeouts.waitForSelector });
      await locator.selectOption({ value });
    } catch (error) {
      console.error(`❌ Error in selectDropdownByValueLocator for value "${value}": ${error.message}`);
      throw error;
    }
  }

  async selectDropdownByValue(selector, value) {
    try {
      await this.page.locator(selector).waitFor({ state: 'visible', timeout: timeouts.waitForSelector });
      await this.page.selectOption(selector, { value });
    } catch (error) {
      console.error(`❌ Error in selectDropdownByValue for selector "${selector}" and value "${value}": ${error.message}`);
      throw error;
    }
  }

  async hoverOverElement(selector) {
    try {
      const element = this.page.locator(selector);
      await element.waitFor({ state: 'visible', timeout: timeouts.waitForSelector });
      await element.hover();
    } catch (error) {
      console.error(`❌ Error in hoverOverElement for selector "${selector}": ${error.message}`);
      throw error;
    }
  }

  async getElementText(selector) {
    try {
      const element = this.page.locator(selector);
      await element.waitFor({ state: 'visible', timeout: timeouts.waitForSelector });
      return await element.textContent();
    } catch (error) {
      console.error(`❌ Error in getElementText for selector "${selector}": ${error.message}`);
      throw error;
    }
  }

  async clickElementByTextFromList(elementLocator, text) {
    try {
      const elements = this.page.locator(elementLocator);
      const count = await elements.count();

      for (let i = 0; i < count; i++) {
        const elementText = await elements.nth(i).textContent();
        if (elementText && elementText.trim() === text) {
          await elements.nth(i).click();
          return;
        }
      }
      throw new Error(`Text "${text}" not found in elements.`);
    } catch (error) {
      console.error(`❌ Error in clickElementByTextFromList for locator "${elementLocator}" and text "${text}": ${error.message}`);
      throw error;
    }
  }

  async scrollElementIntoViewAndClick(selector) {
    try {
      const elementLocator = this.page.locator(selector);
      await elementLocator.waitFor({ state: 'visible' });
      await elementLocator.scrollIntoViewIfNeeded();
      await elementLocator.click();
    } catch (error) {
      console.error(`❌ Error in scrollElementIntoViewAndClick for selector "${selector}": ${error.message}`);
      throw error;
    }
  }

  async selectCheckboxesByTexts(checkboxSelector, labelSelector, textsToMatch) {
    try {
      const checkboxes = this.page.locator(checkboxSelector);
      const count = await checkboxes.count();

      for (let i = 0; i < count; i++) {
        const checkbox = checkboxes.nth(i);
        const label = await checkbox.locator(labelSelector).textContent();
        if (label && textsToMatch.includes(label.trim())) {
          if (!(await checkbox.isChecked())) {
            await checkbox.check();
            console.log(`✅ Selected checkbox with label: "${label.trim()}"`);
          }
        }
      }
    } catch (error) {
      console.error(`❌ Error in selectCheckboxesByTexts: ${error.message}`);
      throw error;
    }
  }

  async unselectCheckboxByText(checkboxSelector, labelSelector, textToMatch) {
    try {
      const checkboxes = this.page.locator(checkboxSelector);
      const count = await checkboxes.count();

      for (let i = 0; i < count; i++) {
        const checkbox = checkboxes.nth(i);
        const label = await checkbox.locator(labelSelector).textContent();
        if (label && label.trim() === textToMatch) {
          if (await checkbox.isChecked()) {
            await checkbox.uncheck();
            console.log(`✅ Unselected checkbox with label: "${textToMatch}"`);
          }
          return;
        }
      }
      throw new Error(`Checkbox with label "${textToMatch}" not found.`);
    } catch (error) {
      console.error(`❌ Error in unselectCheckboxByText: ${error.message}`);
      throw error;
    }
  }

  async goToPageNumber(pageNumberSelector, pageNumber) {
    try {
      const pageButton = this.page.locator(`${pageNumberSelector} >> text="${pageNumber}"`);
      await pageButton.waitFor({ state: 'visible' });
      await pageButton.click();
      await this.page.waitForLoadState('networkidle');
      console.log(`✅ Navigated to page number: ${pageNumber}`);
    } catch (error) {
      console.error(`❌ Error in goToPageNumber for page "${pageNumber}": ${error.message}`);
      throw error;
    }
  }

  async getTotalPages(pageNumberSelector) {
    try {
      const pages = this.page.locator(pageNumberSelector);
      const count = await pages.count();

      let maxPage = 1;
      for (let i = 0; i < count; i++) {
        const text = await pages.nth(i).textContent();
        const num = Number(text?.trim());
        if (!isNaN(num) && num > maxPage) {
          maxPage = num;
        }
      }
      console.log(`✅ Total pages found: ${maxPage}`);
      return maxPage;
    } catch (error) {
      console.error(`❌ Error in getTotalPages: ${error.message}`);
      throw error;
    }
  }
  async clickOnRandomElement(elementsList) {
    try {
      const count = await elementsList.count();
      if (count === 0) {
        throw new Error("The elements list is empty.");
      }
      const randomIndex = Math.floor(Math.random() * count);
      const randomElement = elementsList.nth(randomIndex);
      await randomElement.waitFor({ state: 'visible' });
      await randomElement.click();
      console.log(`✅ Clicked on a random element at index: ${randomIndex}`);
    } catch (error) {
      console.error(`❌ Error in clickOnRandomElement: ${error.message}`);
      throw error;
    }
  }

  async scrollElementIntoViewAndClick(selector) {
    try {
      const elementLocator = this.page.locator(selector);
      await elementLocator.waitFor({ state: 'visible' });
      await elementLocator.scrollIntoViewIfNeeded();
      await elementLocator.click();
      console.log(`✅ Scrolled into view and clicked on element with selector: "${selector}"`);
    } catch (error) {
      console.error(`❌ Error in scrollElementIntoViewAndClick for selector "${selector}": ${error.message}`);
      throw error;
    }
  }

  async scrollDownToPageEnd() {
    try {
      await this.page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      console.log(`✅ Scrolled down to the page end.`);
    } catch (error) {
      console.error(`❌ Error in scrollDownToPageEnd: ${error.message}`);
      throw error;
    }
  }

  async scrollUpToPageTop() {
    try {
      await this.page.evaluate(() => {
        window.scrollTo(0, 0);
      });
      console.log(`✅ Scrolled up to the top of the page.`);
    } catch (error) {
      console.error(`❌ Error in scrollUpToPageTop: ${error.message}`);
      throw error;
    }
  }

  async copyText() {
    try {
      await this.page.keyboard.down('Control');
      await this.page.keyboard.press('KeyA');
      await this.page.keyboard.up('Control');
      await this.page.keyboard.down('Control');
      await this.page.keyboard.press('KeyC');
      await this.page.keyboard.up('Control');
    } catch (error) {
      console.error(`Error copying text: ${error.message}`);
      throw error;
    }
  }

  async pasteText() {
    try {
      await this.page.keyboard.down('Control');
      await this.page.keyboard.press('KeyV');
      await this.page.keyboard.up('Control');
    } catch (error) {
      console.error(`Error pasting text: ${error.message}`);
      throw error;
    }
  }

  async copyTextUsingPress() {
    try {
      await this.page.keyboard.press('Control+A');
      await this.page.keyboard.press('Control+C');
    } catch (error) {
      console.error(`Error copying text: ${error.message}`);
      throw error;
    }
  }

  async pasteTextUsingPress() {
    try {
      await this.page.keyboard.press('Control+V');
    } catch (error) {
      console.error(`Error pasting text: ${error.message}`);
      throw error;
    }
  }

  async scrollElementIntoViewAndClick(selector) {
    try {
      const elementLocator = this.page.locator(selector);
      await elementLocator.waitFor({ state: 'visible' });
      await elementLocator.scrollIntoViewIfNeeded();
      await elementLocator.click();
    } catch (error) {
      console.error(`❌ Error scrolling element into view and clicking for selector "${selector}": ${error.message}`);
      throw error;
    }
  }


  async insertTextAndHitEnter(selector, inputText) {
    try {
      const element = this.page.locator(selector);
      await element.fill("");
      await element.fill(inputText);
      await element.press('Enter');
    } catch (error) {
      console.error(`❌ Error inserting text and hitting Enter for selector "${selector}": ${error.message}`);
      throw error;
    }
  }

  async uploadMultipleFiles(inputSelector, filePaths) {
    try {
      const inputElement = this.page.locator(inputSelector);
      await inputElement.setInputFiles(filePaths);
      console.log(`✅ Multiple files uploaded: ${filePaths.join(', ')}`);
    } catch (error) {
      console.error(`❌ Error uploading multiple files: ${error.message}`);
      throw error;
    }
  }

  async uploadFile(inputSelector, filePath) {
    try {
      if (!filePath) {
        const inputElement = this.page.locator(inputSelector);
        await inputElement.setInputFiles(filePath);
        console.log(`✅ File(s) uploaded: ${filePath}`);
      }
    } catch (error) {
      console.error(`❌ Error uploading file: ${error.message}`);
      throw error;
    }
  }

  async uploadFileWithValidation(inputSelector, filePath, displayedFileNameSelector, expectedFileName) {
    try {
      const inputElement = this.page.locator(inputSelector);
      await inputElement.setInputFiles(filePath);
      console.log(`✅ File uploaded: ${filePath}`);
      await this.page.waitForSelector(displayedFileNameSelector, { state: 'visible', timeout: timeouts.waitForSelector });
      const fileNameElement = this.page.locator(displayedFileNameSelector);
      await fileNameElement.waitFor({ state: 'visible', timeout: timeouts.waitForSelector });
      const actualFileName = await fileNameElement.textContent();
      if (actualFileName?.trim() !== expectedFileName) {
        throw new Error(`File name validation failed. Expected: "${expectedFileName}", Actual: "${actualFileName?.trim()}"`);
      }
      console.log('✅ File name validation passed');
    } catch (error) {
      console.error(`❌ Error in uploadFileWithValidation: ${error.message}`);
      throw error;
    }
  }

  async waitAndFillData(element, value) {
    try {
      await element.waitFor({ state: 'visible', timeout: timeouts.waitForSelector });
      await element.fill(value);
    } catch (error) {
      console.error(`❌ Error in waitAndFillData: ${error.message}`);
      throw error;
    }
  }

  async clearAndFillData(element, value) {
    try {
      await element.waitFor({ state: 'visible', timeout: timeouts.waitForSelector });
      await element.fill('');
      await element.fill(value);
    } catch (error) {
      console.error(`❌ Error in clearAndFillData: ${error.message}`);
      throw error;
    }
  }

  async waitAndClick(element) {
    try {
      await element.waitFor({ state: 'visible', timeout: timeouts.waitForSelector });
      await element.click();
    } catch (error) {
      console.error(`❌ Error in waitAndClick: ${error.message}`);
      throw error;
    }
  }

  async hoverOverElement(element) {
    try {
      await element.waitFor({ state: 'visible', timeout: timeouts.waitForSelector });
      await element.hover();
    } catch (error) {
      console.error(`❌ Error in hoverOverElement: ${error.message}`);
      throw error;
    }
  }

  async getElementText(element) {
    try {
      await element.waitFor({ state: 'visible', timeout: timeouts.waitForSelector });
      return element.textContent();
    } catch (error) {
      console.error(`❌ Error in getElementText: ${error.message}`);
      throw error;
    }
  }

  async clickElementByTextFromList(elements, text) {
    try {
      const count = await elements.count();
      for (let i = 0; i < count; i++) {
        const elementText = await elements.nth(i).textContent();
        if (elementText && elementText.trim() === text) {
          await elements.nth(i).click();
          break;
        }
      }
    } catch (error) {
      console.error(`❌ Error in clickElementByTextFromList: ${error.message}`);
      throw error;
    }
  }

  async selectCheckboxesByTexts(checkboxes, labels, textsToMatch) {
    if (!Array.isArray(textsToMatch) || textsToMatch.length === 0) {
      throw new Error("textsToMatch must be a non-empty array.");
    }
    const count = await checkboxes.count();
    for (let i = 0; i < count; i++) {
      const checkbox = checkboxes.nth(i);
      const label = await checkbox.locator(labels).textContent();
      if (label && textsToMatch.includes(label.trim())) {
        if (!(await checkbox.isChecked())) {
          await checkbox.check();
        }
      }
    }
  }

  async unselectCheckboxByText(checkboxes, labels, textToMatch) {
    if (typeof textToMatch !== 'string' || textToMatch.trim() === '') {
      throw new Error("textToMatch must be a non-empty string.");
    }
    const count = await checkboxes.count();
    for (let i = 0; i < count; i++) {
      const checkbox = checkboxes.nth(i);
      const label = await checkbox.locator(labels).textContent();
      if (label && label.trim() === textToMatch) {
        if (await checkbox.isChecked()) {
          await checkbox.uncheck();
        }
        break;
      }
    }
  }

  async scrollElementIntoViewAndClick(element) {
    try {
      await element.scrollIntoViewIfNeeded();
      await element.click();
    } catch (error) {
      console.error(`❌ Error scrolling element into view and clicking: ${error.message}`);
      throw error;
    }
  }

  async uploadFile(inputElement, filePath) {
    try {
      if (!filePath) {
        throw new Error("filePath must be a non-empty string.");
      }
      await inputElement.setInputFiles(filePath);
      console.log(`✅ File uploaded: ${filePath}`);
    } catch (error) {
      console.error(`❌ Error in uploadFile: ${error.message}`);
      throw error;
    }
  }

  async uploadFileWithValidation(inputElement, filePath, displayedFileNameElement, expectedFileName) {
    try {
      await inputElement.setInputFiles(filePath);
      console.log(`✅ File uploaded: ${filePath}`);
      await displayedFileNameElement.waitFor({ state: 'visible', timeout: timeouts.waitForSelector });
      const actualFileName = await displayedFileNameElement.textContent();
      if (actualFileName?.trim() !== expectedFileName) {
        throw new Error(`File name validation failed. Expected: "${expectedFileName}", Actual: "${actualFileName?.trim()}"`);
      }
    } catch (error) {
      console.error(`❌ Error in uploadFileWithValidation: ${error.message}`);
      throw error;
    }
    console.log('✅ File name validation passed');
  }


  async clearUploadedFiles(selector) {
    try {
      const inputElement = await this.page.$(selector);
      if (!inputElement) {
        throw new Error(`File input element not found for selector: ${selector}`);
      }
      await inputElement.setInputFiles([]);
      console.log(`✅ Files cleared from input: ${selector}`);
    } catch (error) {
      console.error(`❌ Error clearing files: ${error.message}`);
      throw error;
    }
  }



}

module.exports = ActionHelpers;