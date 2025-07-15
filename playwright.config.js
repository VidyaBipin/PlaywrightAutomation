// @ts-check
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';


// Load environment variables
dotenv.config({ path: path.resolve(__dirname, `env/.env.${process.env.ENV || 'qa'}`) });
//const projectName = process.env.PROJECT_NAME || 'defaultProject';
//const envName = process.env.ENV || 'qa';
const isCI = process.env.CI === 'true';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: isCI ? 1 : 1,
  workers: isCI ? 3 : 2,
  reporter: [
    ['html'],
    ['list'],
    // ['allure-playwright', {
    //   resultsDir: 'allure-results',  // <-- correct property for Allure results folder
    //   detail: true,
    //   suiteTitle: true,
    // }],


  ],
  use: {
    viewport: null, // No constraints on viewport
    launchOptions: {
      args: ['--start-maximized'], // Request maximized mode
    },
    trace: 'retain-on-failure',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    timeout: 480000,
    expect: { timeout: 30000 },
  },
  projects: [
    {
      name: `chromium`,
      use: { browserName: 'chromium' },
    },
    // {
    //   name: `firefox`,
    //   use: {
    //     browserName: 'firefox',
    //     viewport: { width: 1536, height: 816 },
    //   },
    // },
    // {
    //   name: `webkit`,
    //   use: {
    //     browserName: 'webkit',
    //     viewport: { width: 1536, height: 816 }, // Adjust based on resolution
    //   },
    // }
  ],
  
});
