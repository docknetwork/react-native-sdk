const axios = require('axios');

const showTests = false;

class SlackReporter {
  async onRunComplete(contexts, results) {
    let failedTests = 0;
    let totalTests = 0;
    let blocks = []; // Slack Blocks array

    results.testResults.forEach(testResult => {
      testResult.testResults.forEach(result => {
        totalTests++;
        const symbol =
          result.status === 'passed' ? ':large_green_circle:' : ':x:';
        if (result.status !== 'passed') {
          failedTests++;
        }

        if (showTests) {
          blocks.push({
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `${symbol} *${result.fullName}*`,
              },
            ],
          });
          blocks.push({
            type: 'divider',
          });
        }
      });
    });

    blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: 'Wallet SDK Integration Tests',
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'plain_text',
          text:
            failedTests === 0
              ? `All ${totalTests} tests passed! :tada:`
              : `${failedTests} of ${totalTests} tests failed :x:`,
          emoji: true,
        },
      },
      ...blocks,
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `<${process.env.GITHUB_ACTION_URL}|View Run in Github>`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `PR Number: <${process.env.PR_LINK}|${process.env.PR_NUMBER}>`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `PR Title: <${process.env.PR_LINK}|${process.env.PR_TITLE}>`,
        },
      },
    ];

    if (process.env.SLACK_WEBHOOK_URL) {
      await axios.post(process.env.SLACK_WEBHOOK_URL, {
        blocks: blocks,
      });
    }
  }
}

module.exports = SlackReporter;
