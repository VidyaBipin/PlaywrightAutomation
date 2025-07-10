const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

//const ccRecipients = ['neethu.c@codelynks.com', 'harmya.k@codelynks.com'];

async function sendEmailReport() {
    const reportPath = path.resolve(__dirname, 'playwright-report/index.html');

    // Check if the report file exists
    if (!fs.existsSync(reportPath)) {
        console.error(`❌ Test report not found: ${reportPath}`);
        return;
    }

    // Set up email transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'vidya.s@codelynks.com',
            pass: 'ehrqhzmicsprtmzs', // Replace with your app pass from security->2step verification->app passwords
        },
    });

    // Mail options
    const mailOptions = {
        from: 'vidya.s@codelynks.com', // Sender's email
        to: 'vidya.s@codelynks.com', // Main recipient
        //cc: ccRecipients.length > 0 ? ccRecipients.join(',') : undefined, // Add CC if available
        subject: 'Playwright Test Report', // Email subject
        html: `
            <p>Hi Team,</p>
            <p>Please find the attached Playwright test report.</p>
            <p>Best regards,</p>
            <p>Your Automation Team</p>
        `,
        attachments: [
            {
                filename: 'Playwright_Automation_Report.html',
                path: reportPath, // Attach report
            },
        ],
    };

    try {
        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 Email sent successfully: ${info.response}`);
    } catch (error) {
        console.error(`❌ Error sending email: ${error.message}`);
    }
}

module.exports = { sendEmailReport };
