/**
 * Common helper methods
 */

const crypto = require('crypto')
const { WebClient } = require('@slack/web-api')

/**
 * Returns an instance of the slack web api client
 */
function getSlackWebClient (botToken) {
  return new WebClient(botToken)
}

/**
 * Verify that the request is from slack
 * Documentation: https://api.slack.com/docs/verifying-requests-from-slack
 * Tutorial for node: https://medium.com/@rajat_sriv/verifying-requests-from-slack-using-node-js-69a8b771b704
 * @param {Object} event
 */
function authenticateRequest (event) {
  const body = event.body
  const slackSignature = event.headers['X-Slack-Signature']
  const timestamp = event.headers['X-Slack-Request-Timestamp']
  const sigBasestring = `v0:${timestamp}:${body}`
  const slackSigningSecret = process.env.CLIENT_SIGNING_SECRET
  const receivedSignature = 'v0=' + crypto.createHmac('sha256', slackSigningSecret).update(sigBasestring, 'utf8').digest('hex')
  return crypto.timingSafeEqual(Buffer.from(receivedSignature), Buffer.from(slackSignature))
}

/**
 * Encrypts a string
 * @param {String} text
 */
function encrypt (text) {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-128-cbc', Buffer.from('p3s6v9y$B&E(H+Mb'), iv)
  let encrypted = cipher.update(text, 'utf8', 'binary')
  encrypted += cipher.final('binary')
  return iv.toString('hex') + ':' + Buffer.from(encrypted, 'binary').toString('hex')
}

/**
 * Decrypts a string
 * @param {String} text
 */
function decrypt (text) {
  const split = text.split(':')
  const iv = Buffer.from(split[0], 'hex')
  const encrypted = Buffer.from(split[1], 'hex')
  const decipher = crypto.createDecipheriv('aes-128-cbc', Buffer.from('p3s6v9y$B&E(H+Mb'), iv)
  let decrypted = decipher.update(encrypted, 'binary', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted.toString('hex')
}

module.exports = {
  getSlackWebClient,
  authenticateRequest,
  encrypt,
  decrypt
}
