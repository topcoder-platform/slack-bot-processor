/**
 * Displays the sign in page with the Add to Slack button
 */
const HttpStatus = require('http-status-codes')

module.exports.handler = (event, context, callback) => {
  const response = {
    statusCode: HttpStatus.OK,
    headers: {
      'Content-Type': 'text/html'
    },
    body: `<html><body><div align="center">${process.env.ADD_TO_SLACK_BUTTON}</div></body></html>`
  }

  callback(null, response)
}
