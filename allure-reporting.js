const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

/**
 * Generate the Allure report with custom metadata.
 */
function generateAllureReport(outputDir = './allure-report', resultsDir = './allure-results') {
    console.log('\n📊 Generating Allure report...');

     if (!fs.existsSync(resultsDir)) {
        console.warn(`⚠️ Allure results directory not found: ${resultsDir}`);
        console.warn(`🛠️ Creating directory: ${resultsDir}`);
        try {
            fs.mkdirSync(resultsDir, { recursive: true });
            console.log(`✅ Directory created: ${resultsDir}`);
        } catch (error) {
            console.error(`❌ Failed to create results directory: ${error.message}`);
            process.exit(1);
        }
    }
    // Define environment properties
    const envProps = [
        `ENV=${process.env.ENV || ''}`,
        `BASE_URL=${process.env.BASE_URL || ''}`,
        `USERNAME=${process.env.USERNAME || ''}`,
        `PROJECT_NAME=${process.env.PROJECT_NAME || ''}`,
    ].join('\n');

    // Construct dynamic report title using environment variables
    const reportTitle = `${process.env.PROJECT_NAME || 'Demo Project'} - Allure Report (${process.env.ENV || 'QA'})`;

    // Write environment properties to environment.properties file
    fs.writeFileSync(path.join(resultsDir, 'environment.properties'), envProps);
    console.log('✅ Allure environment.properties written');

    // Add executor.json for custom metadata
    const executorJson = {
        name: 'Allure Executor',
        reportName: reportTitle,
    };

    fs.writeFileSync(path.join(resultsDir, 'executor.json'), JSON.stringify(executorJson, null, 2));
    console.log('✅ Allure executor.json written');

    // Generate the Allure report
    return new Promise((resolve, reject) => {
        exec(`allure generate ${resultsDir} --clean -o ${outputDir}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Error generating Allure report:\n${stderr}`);
                reject(error);
            } else {
                console.log(stdout);
                console.log(`\n✅ Allure report generated successfully at: ${outputDir}`);
                resolve();
            }
        });
    });
}

module.exports = { generateAllureReport };
