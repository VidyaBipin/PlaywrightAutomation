
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config();

const { sendEmailReport } = require('./send-report');

// Step 1: Accept inputs from env or CLI args
const env = process.env.TEST_ENV || 'qa';
const filesInput = process.env.TEST_FILES || 'all'; // comma-separated: 'file1.spec.js,file2.spec.js'
const tag = process.env.TEST_TAG || ''; // like @smoke

require('dotenv').config({ path: `./env/.env.${env}` });

function getTestFiles() {
  const testDir = path.join(__dirname, 'tests');
  return fs.readdirSync(testDir).filter(file => file.endsWith('.spec.js'));
}

function getCommand(files, tag) {
  let cmd = 'npx playwright test';

  if (files !== 'all') {
    const selectedFiles = files.split(',').map(f => `tests/${f}`).join(' ');
    cmd += ` ${selectedFiles}`;
  }

  if (tag) {
    cmd += ` --grep "${tag}"`;
  }

  return cmd;
}

function run() {
  const allFiles = getTestFiles();
  const command = getCommand(filesInput, tag);

  console.log(`Running Playwright tests with command:\n${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
    sendEmailReport();
    process.exit(0);
  } catch (err) {
    console.error('Test run failed.');
    sendEmailReport();
    process.exit(1);
  }
}

run();
