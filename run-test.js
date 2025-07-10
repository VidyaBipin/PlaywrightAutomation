const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');
require('dotenv').config();
const { sendEmailReport } = require('./send-report');




/**
 * Loads environment variables from a specific .env file based on the provided environment name.
 * If the corresponding .env file exists in the 'env' directory, it loads the variables using dotenv.
 * If the file does not exist, logs an error and exits the process.
 *
 * @param {string} envName - The name of the environment (e.g., 'development', 'production').
 */
function loadEnvironment(envName) {
  const envFilePath = path.resolve(__dirname, `env/.env.${envName}`);
  if (fs.existsSync(envFilePath)) {
    console.log(`\n🔧 Loading environment variables from: ${envFilePath}`);
    require('dotenv').config({ path: envFilePath });
  } else {
    console.error(`❌ Environment file not found: ${envFilePath}`);
    process.exit(1);
  }
}

 /**
 * Lists all test files in the 'tests' directory that have a '.spec.js' extension.
 * If the 'tests' directory does not exist, logs an error and exits the process.
 *
 * @returns {string[]} An array of filenames ending with '.spec.js' found in the 'tests' directory.
 */
function listTestFiles() {
  const testDir = path.resolve(__dirname, 'tests');
  if (!fs.existsSync(testDir)) {
    console.error(`❌ Tests directory not found at: ${testDir}`);
    process.exit(1);
  }
  //`readdirSync` is a synchronous method from Node.js's `fs` (filesystem) module. It reads the contents of a directory and returns an array of filenames (not full paths) found in that directory.
  // It filters the files to include only those that end with '.spec.js', which are typically used for test specifications in JavaScript projects.
  return fs.readdirSync(testDir).filter((file) => file.endsWith('.spec.js'));
}

/**
 * Extract unique tags from `test` functions in test files.
 * @param {string} testDir - The directory containing test files.
 * @returns {Set<string>} - A set of unique tags (e.g., @smoke, @regression).
 */
function extractTagsFromTestFunctions(testDir = 'tests') {
  const tags = new Set();
  const testFiles = listTestFiles();

  for (const file of testFiles) {
    // Reads the full content of each test file as a stringpath.join(testDir, file) gives the full path to each file.
    const content = fs.readFileSync(path.join(testDir, file), 'utf-8');
    // Uses a regular expression to find all occurrences of `test` functions with tags in the content.
    // The regex matches `test` function calls that contain a string argument with a tag (e.g., @smoke, @regression).
    const matches = content.match(/test\(.*?['"`](@\w+).*?['"`]/g);
   if (matches) {
  matches.forEach((match) => {
    const allTags = match.match(/@\w+/g); // ⬅️ GLOBAL match for all tags
    if (allTags) {
      allTags.forEach((tag) => tags.add(tag)); // Add each tag to the Set
    }
  });
}
  }

  return tags;
}

/**
 * Prompt the user with a question and get input.
 * @param {string} question - The question to display.
 * @returns {Promise<string>} - The user's input.
 */
// readline.createInterface() creates a command-line interface to accept user input and print output.
function promptUser(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  // The resolve function is called when we’re ready to return a result (in this case, the user’s answer).
  return new Promise((resolve) =>
    //This prints a question to the terminal and waits for the user to type a response.When the user presses Enter, it executes the callback function with the typed input (stored in the answer variable).
    rl.question(`\n➡️  ${question} `, (answer) => {
      // Close the readline interface and resolve the promise with the user's input.
      rl.close();
      resolve(answer.trim());
    })
  );
}

/**
 * Run the selected test files or scope using Playwright.
 * @param {string[]} filesToRun - List of test files to execute.
 * @param {string[]} tags - Tags to filter tests (e.g., @regression, @smoke).
 */
function executeTests(filesToRun = [], tags = []) {
  console.log('\n🚀 Starting test execution...\n');

  const tagFilter = tags.length ? `--grep ${tags.join('|')}` : '';
  const testRunCommand = filesToRun.length
    ? `npx playwright test ${filesToRun.join(' ')} ${tagFilter}`
    : `npx playwright test ${tagFilter}`;

  console.log(`▶️ Running: ${testRunCommand}`);

  try {
    const output = execSync(testRunCommand, { stdio: 'inherit' });
    return { success: true };
  } catch (error) {
    console.error(`❌ Test execution failed.`);
    return { success: false };
  }
}

/**
 * Main function to handle test execution workflow.
 */
async function runTests() {
  let success = false;

  try {
    const envName = await promptUser('Select environment (qa, stage, production):');
    if (!['qa', 'stage', 'production'].includes(envName)) {
      throw new Error('Invalid environment. Please choose: "qa", "stage", or "production".');
    }
    loadEnvironment(envName);

    const testFiles = listTestFiles();
    console.log('\n📄 Available test files:');
    testFiles.forEach((file, index) => console.log(`  ${index + 1}. ${file}`));

    const fileSelection = await promptUser(
      'Enter "all" to run all files, or select files by number separated by commas:'
    );

    let filesToRun = [];
    if (fileSelection.toLowerCase() === 'all') {
      filesToRun = testFiles;
    } else {
      const indexes = fileSelection
        .split(',')
        .map((num) => parseInt(num.trim(), 10) - 1)
        .filter((index) => index >= 0 && index < testFiles.length);

      if (indexes.length === 0) {
        throw new Error('Invalid selection. Please choose "all" or valid file numbers.');
      }
      filesToRun = indexes.map((index) => testFiles[index]);
    }

    const tags = Array.from(extractTagsFromTestFunctions());
    if (tags.length > 0) {
      console.log('\n📂 Detected tags:');
      tags.forEach((tag, index) => console.log(`  ${index + 1}. ${tag}`));
    }

    const tagSelection = await promptUser(
      'Enter a tag (e.g., @smoke) to run specific tests with tags, or "none" to ignore tags:'
    );

    let selectedTags = [];
    if (tagSelection.toLowerCase() !== 'none') {
      const normalizedTagSelection = tagSelection.startsWith('@') ? tagSelection : `@${tagSelection}`;
      if (tags.includes(normalizedTagSelection)) {
        selectedTags = [normalizedTagSelection];
      } else {
        throw new Error('Invalid tag selection. Please choose a valid tag.');
      }
    }

    // ✅ FIX: Add `await`
    const result = await executeTests(filesToRun, selectedTags);
    success = result.success;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }

  // ✅ Always send the report
  try {
    await sendEmailReport();
  } catch (err) {
    console.error('❌ Failed to send email report:', err.message);
  }

  // ✅ Exit cleanly depending on success
  process.exit(success ? 0 : 1);
}

runTests();
