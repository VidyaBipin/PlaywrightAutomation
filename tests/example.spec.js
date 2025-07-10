
//import { test, expect } from '@playwright/test';
const { test, expect } = require('@playwright/test');


test.describe('Playwright Homepage Tests', () => {
  
  test.beforeEach(async ({ page }, testInfo) => {
    
    await page.goto('https://playwright.dev/');
});

test(' has title', async ({ page }) => {
  //await page.goto('https://playwright.dev/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);
  await page.waitForTimeout(5000); // Wait for 2 seconds to observe the title
});

test('@smoke get started link', async ({ page }) => {
  //await page.goto('https://playwright.dev/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
   await page.waitForTimeout(5000); 
});

});
