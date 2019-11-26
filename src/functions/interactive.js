/**
 * Handler for iteractions with interactive components in Client slack
 */
const querystring = require('querystring')
const HttpStatus = require('http-status-codes')
const rp = require('request-promise')
const config = require('config')
const { getSlackWebClient, authenticateRequest } = require('../common/helper')
const { updateProjectStatus, getProject } = require('../common/dbHelper')
const logger = require('../common/logger')

const INTERACTIVE_MESSAGE_TYPES = config.get('INTERACTIVE_MESSAGE_TYPES')
const slackWebClient = getSlackWebClient()

module.exports.handler = async event => {
  try {
    const isValidRequest = authenticateRequest(event)
    if (!isValidRequest) {
      return {
        statusCode: HttpStatus.BAD_REQUEST
      }
    }

    // Payload is an URL encoded string
    var payload = JSON.parse(querystring.decode(event.body).payload)

    switch (payload.type) {
      case 'interactive_message':
        switch (payload.actions[0].name) {
          case INTERACTIVE_MESSAGE_TYPES.ACCEPT:
            await handleAccept(payload)
            break
          case INTERACTIVE_MESSAGE_TYPES.DECLINE:
            await handleDecline(payload)
            break
          default:
        }
        break
      default:
    }

    return { // Acknowledge to Slack that the message was received
      statusCode: HttpStatus.OK
    }
  } catch (err) {
    logger.logFullError(err)
    // Post error to Client Slack
    return slackWebClient.chat.postMessage({
      thread_ts: payload.message_ts,
      channel: payload.channel.id,
      text: 'An error occured. Please try again'
    })
  }
}

/**
 * Handles click on the Accept button
 * @param {Object} payload
 */
async function handleAccept (payload) {
  // Get project
  const projectId = payload.callback_id
  const project = await getProject(projectId)

  // Check if valid
  if (!project) {
    return slackWebClient.chat.postMessage({
      thread_ts: payload.message_ts,
      channel: payload.channel.id,
      text: config.get('CONSTANTS.PROJECT_DOES_NOT_EXIST')
    })
  }

  // Take action based on current project status
  switch (project.status) {
    case config.get('PROJECT_STATUS.ACCEPTED'): {
      return slackWebClient.chat.postMessage({
        thread_ts: payload.message_ts,
        channel: payload.channel.id,
        text: 'Project has already been accepted'
      })
    }
    case config.get('PROJECT_STATUS.DECLINED'): {
      return slackWebClient.chat.postMessage({
        thread_ts: payload.message_ts,
        channel: payload.channel.id,
        text: 'Project has already been declined. You cannot accept it now.'
      })
    }
    case config.get('PROJECT_STATUS.APPROVED'): {
      return slackWebClient.chat.postMessage({
        thread_ts: payload.message_ts,
        channel: payload.channel.id,
        text: 'Project has already been approved. You cannot accept it now.'
      })
    }
    case config.get('PROJECT_STATUS.RESPONDED'): {
      // Post accepted to TC Central
      await rp({
        method: 'POST',
        uri: `${process.env.CENTRAL_LAMBDA_URI}/accept`,
        body: {
          projectId
        },
        json: true
      })

      // Update status of project to ACCEPTED
      await updateProjectStatus(project.id, config.get('PROJECT_STATUS.ACCEPTED'))

      // Post acknowledgement to Client Slack
      return slackWebClient.chat.postMessage({
        thread_ts: payload.message_ts,
        channel: payload.channel.id,
        text: 'Project has been accepted.'
      })
    }
  }
}

/**
 * Handles click on Decline button
 * @param {Object} payload
 */
async function handleDecline (payload) {
  const projectId = payload.callback_id
  const project = await getProject(projectId)

  // Check if project exists
  if (!project) {
    return slackWebClient.chat.postMessage({
      thread_ts: payload.message_ts,
      channel: payload.channel.id,
      text: config.get('CONSTANTS.PROJECT_DOES_NOT_EXIST')
    })
  }

  // Handle based on current project status
  switch (project.status) {
    case config.get('PROJECT_STATUS.ACCEPTED'): {
      return slackWebClient.chat.postMessage({
        thread_ts: payload.message_ts,
        channel: payload.channel.id,
        text: 'Project has already been accepted. You cannot decline it now'
      })
    }
    case config.get('PROJECT_STATUS.DECLINED'): {
      return slackWebClient.chat.postMessage({
        thread_ts: payload.message_ts,
        channel: payload.channel.id,
        text: 'Project has already been declined.'
      })
    }
    case config.get('PROJECT_STATUS.APPROVED'): {
      return slackWebClient.chat.postMessage({
        thread_ts: payload.message_ts,
        channel: payload.channel.id,
        text: 'Project has already been approved. You cannot decline it now.'
      })
    }
    case config.get('PROJECT_STATUS.RESPONDED'): {
      // POST to TC Central
      await rp({
        method: 'POST',
        uri: `${process.env.CENTRAL_LAMBDA_URI}/decline`,
        body: {
          projectId
        },
        json: true
      })

      await slackWebClient.chat.postMessage({
        thread_ts: payload.message_ts,
        channel: payload.channel.id,
        text: 'Project declined.'
      })

      // Set project status to declined
      await updateProjectStatus(project.id, config.get('PROJECT_STATUS.DECLINED'))
    }
  }
}
