const axios = require('axios');

class SlackReporter {
  async onRunComplete(contexts, results) {
    let failedTests = 0;
    let blocks = []; // Slack Blocks array

    results.testResults.forEach(testResult => {
      testResult.testResults.forEach(result => {
        const symbol =
          result.status === 'passed' ? ':large_green_circle:' : ':x:';
        if (result.status !== 'passed') {
          failedTests++;
        }

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
      });
    });

    blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: 'Wallet SDK E2E Tests',
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'plain_text',
          text:
            failedTests === 0
              ? 'All tests passed! :tada:'
              : `${failedTests} tests failed`,
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
    ];

    await axios.post(process.env.SLACK_WEBHOOK_URL, {
      blocks: blocks,
    });
  }
}

module.exports = SlackReporter;
