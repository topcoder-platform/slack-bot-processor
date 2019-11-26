/**
 * Handler for project response message
 */

const HttpStatus = require('http-status-codes')
const config = require('config')
const schema = require('../common/schema')
const { getSlackWebClient } = require('../common/helper')
const { getProject } = require('../common/dbHelper')
const logger = require('../common/logger')

const slackWebClient = getSlackWebClient()

module.exports.handler = async event => {
  try {
    // Validate request
    const { error, value } = schema.responseSchema.validate(JSON.parse(event.body))
    if (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        body: JSON.stringify(error)
      }
    }

    // Get project
    const project = await getProject(value.projectId)

    // Check if valid
    if (!project) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        body: JSON.stringify({
          name: config.get('CONSTANTS.PROJECT_DOES_NOT_EXIST')
        })
      }
    }

    // Post response message with "Accept" and "Decline" buttons to Client Slack
    await slackWebClient.chat.postMessage({
      channel: project.clientSlackChannel,
      text: value.text,
      mrkdwn: true,
      thread_ts: project.clientSlackThread,
      attachments: [
        {
          fallback: 'Accept or decline response',
          callback_id: project.id,
          attachment_type: 'default',
          actions: [{
            name: config.get('INTERACTIVE_MESSAGE_TYPES.ACCEPT'),
            text: 'Accept',
            type: 'button'
          }, {
            name: config.get('INTERACTIVE_MESSAGE_TYPES.DECLINE'),
            text: 'Decline',
            type: 'button'
          }]
        }]
    })

    // Return OK
    return {
      statusCode: HttpStatus.OK
    }
  } catch (e) {
    logger.logFullError(e)
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR
    }
  }
}
