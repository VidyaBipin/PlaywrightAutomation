import timeouts from './timeouts.json';
import { expect } from '@playwright/test';

class FrameHelper {

  /**
   * Initializes the FrameHelper class with the Playwright page object.
   * @param {import('@playwright/test').Page} page - The Playwright page object.
   */
  constructor(page) {
    this.page = page;
  }

  /**
   * Locates an element inside a frame by URL and clicks it.
   * @param {string} frameUrl - The URL of the iframe.
   * @param {string} selector - The selector for the element to click.
   * @throws {Error} Throws an error if the frame is not found.
   */
  async locateAndClickInFrameByUrl(frameUrl, selector) {
    const frame = this.page.frame({ url: frameUrl });
    if (!frame) {
      throw new Error(`Frame with URL "${frameUrl}" not found.`);
    }
    await frame.click(selector);
  }

  /**
   * Locates an element inside a frame by URL and fills it with the provided text.
   * @param {string} frameUrl - The URL of the iframe.
   * @param {string} selector - The selector for the element to fill.
   * @param {string} text - The text to fill into the element.
   * @throws {Error} Throws an error if the frame is not found.
   */
  async locateAndFillInFrameByUrl(frameUrl, selector, text) {
    const frame = this.page.frame({ url: frameUrl });
    if (!frame) {
      throw new Error(`Frame with URL "${frameUrl}" not found.`);
    }
    await frame.fill(selector, text);
  }

  /**
   * Locates an element inside a frame by name and clicks it.
   * @param {string} frameName - The name of the iframe.
   * @param {string} selector - The selector for the element to click.
   * @throws {Error} Throws an error if the frame is not found.
   */
  async locateAndClickInFrameByName(frameName, selector) {
    const frame = this.page.frame({ name: frameName });
    if (!frame) {
      throw new Error(`Frame with name "${frameName}" not found.`);
    }
    await frame.click(selector);
  }

  /**
   * Locates an element inside a frame by name and fills it with the provided text.
   * @param {string} frameName - The name of the iframe.
   * @param {string} selector - The selector for the element to fill.
   * @param {string} text - The text to fill into the element.
   * @throws {Error} Throws an error if the frame is not found.
   */
  async locateAndFillInFrameByName(frameName, selector, text) {
    const frame = this.page.frame({ name: frameName });
    if (!frame) {
      throw new Error(`Frame with name "${frameName}" not found.`);
    }
    await frame.fill(selector, text);
  }

  /**
   * Locate the nth child frame recursively and return it.
   * @param {import('@playwright/test').Frame} frame - The current Playwright frame (or page frame).
   * @param {number[]} frameIndices - An array of indices representing the nesting hierarchy.
   * @returns {Promise<import('@playwright/test').Frame>} - The Playwright Frame object.
   */
  async getNestedFrameByIndex(frame, frameIndices) {
    let currentFrame = frame;
    for (const index of frameIndices) {
      const childFrames = currentFrame.childFrames();
      if (index >= childFrames.length) {
        throw new Error(`Child frame at index ${index} not found.`);
      }
      currentFrame = childFrames[index];
    }
    return currentFrame;
  }

  /**
   * Click an element inside a nested frame using frame indices.
   * @param {number[]} frameIndices - An array of indices representing the nesting hierarchy.
   * @param {string} selector - The CSS selector for the element to click.
   */
  async clickInNestedFrameByIndex(frameIndices, selector) {
    const mainFrame = this.page.mainFrame();
    const targetFrame = await this.getNestedFrameByIndex(mainFrame, frameIndices);
    await targetFrame.click(selector);
  }

  /**
   * Fill a text field inside a nested frame using frame indices.
   * @param {number[]} frameIndices - An array of indices representing the nesting hierarchy.
   * @param {string} selector - The CSS selector for the text field.
   * @param {string} text - The text to fill in the text field.
   */
  async fillInNestedFrameByIndex(frameIndices, selector, text) {
    const mainFrame = this.page.mainFrame();
    const targetFrame = await this.getNestedFrameByIndex(mainFrame, frameIndices);
    await targetFrame.fill(selector, text);
  }

  /**
   * Assert that an element inside a frame by URL contains the expected text.
   * @param {string} frameUrl - The URL of the iframe.
   * @param {string} selector - The selector for the element.
   * @param {string} expectedText - The expected text content.
   */
  async assertTextInFrameByUrl(frameUrl, selector, expectedText) {
    const frame = this.page.frame({ url: frameUrl });
    if (!frame) {
      throw new Error(`Frame with URL "${frameUrl}" not found.`);
    }
    const element = frame.locator(selector);
    await expect(element).toHaveText(expectedText);
  }

  /**
   * Retrieve the value of an input field inside a frame by URL.
   * @param {string} frameUrl - The URL of the iframe.
   * @param {string} selector - The selector for the input field.
   * @returns {Promise<string>} - The value of the input field.
   */
  async getInputValueInFrameByUrl(frameUrl, selector) {
    const frame = this.page.frame({ url: frameUrl });
    if (!frame) {
      throw new Error(`Frame with URL "${frameUrl}" not found.`);
    }
    const inputElement = frame.locator(selector);
    return await inputElement.inputValue();
  }

  /**
   * Check if an element is visible inside a nested frame.
   * @param {number[]} frameIndices - An array of indices representing the nesting hierarchy.
   * @param {string} selector - The CSS selector for the element.
   * @returns {Promise<boolean>} - True if the element is visible, false otherwise.
   */
  async isElementVisibleInNestedFrame(frameIndices, selector) {
    const mainFrame = this.page.mainFrame();
    const targetFrame = await this.getNestedFrameByIndex(mainFrame, frameIndices);
    const element = targetFrame.locator(selector);
    return await element.isVisible();
  }

  /**
   * Get the text content of an element inside a nested frame using indices.
   * @param {number[]} frameIndices - An array of indices representing the nesting hierarchy.
   * @param {string} selector - The CSS selector for the element.
   * @returns {Promise<string>} - The text content of the element.
   */
  async getTextContentInNestedFrame(frameIndices, selector) {
    const mainFrame = this.page.mainFrame();
    const targetFrame = await this.getNestedFrameByIndex(mainFrame, frameIndices);
    const element = targetFrame.locator(selector);
    return await element.textContent();
  }

  /**
   * Retrieve the attribute value of an element inside a frame by URL.
   * @param {string} frameUrl - The URL of the iframe.
   * @param {string} selector - The selector for the element.
   * @param {string} attributeName - The name of the attribute to retrieve.
   * @returns {Promise<string | null>} - The value of the attribute, or null if it does not exist.
   */
  async getAttributeValueInFrameByUrl(frameUrl, selector, attributeName) {
    const frame = this.page.frame({ url: frameUrl });
    if (!frame) {
      throw new Error(`Frame with URL "${frameUrl}" not found.`);
    }
    const element = frame.locator(selector);
    return await element.getAttribute(attributeName);
  }
}

export default FrameHelper;