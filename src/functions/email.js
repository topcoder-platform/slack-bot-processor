/**
 * Handles the @topbot email command
 */
const rp = require('request-promise')
const config = require('config')
const { getSlackWebClient } = require('../common/helper')
const { getProjectByClientSlackThread } = require('../common/dbHelper')
const slackWebClient = getSlackWebClient()
const emailRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i // eslint-disable-line

module.exports.handler = async event => {
  const body = JSON.parse(event.body)

  // Check if email command is issued inside a project request thread
  if (!body.event.thread_ts) {
    return slackWebClient.chat.postMessage({
      thread_ts: body.event.ts,
      channel: body.event.channel,
      text: 'Email command can only be issued in a project request thread'
    })
  }

  var email
  // Try to parse email
  try {
    const mailtoEmail = body.event.text.split(' ').slice(2).join(' ').trim() // Remove the first two words from text like "<user> email email_id"
    if (emailRegex.test(mailtoEmail)) {
      email = mailtoEmail // If Slack returns plain email ids instead of formatted
    } else {
      email = mailtoEmail.split('|')[1].slice(0, -1) // Slack returns fromatted email ids with text, <mailto:abc@gmail.com|abc@gmail.com>. So we extract only email id from this
    }
  } catch (e) {
    // In case of any error in parsing, email id is invalid
    return slackWebClient.chat.postMessage({
      thread_ts: body.event.ts,
      channel: body.event.channel,
      text: 'Email id is invalid'
    })
  }

  // Check if email is empty
  if (email.length === 0) {
    return slackWebClient.chat.postMessage({
      thread_ts: body.event.ts,
      channel: body.event.channel,
      text: 'Email id cannot be empty'
    })
  }

  // Validate email
  if (!emailRegex.test(email)) {
    return slackWebClient.chat.postMessage({
      thread_ts: body.event.ts,
      channel: body.event.channel,
      text: 'Email id is invalid'
    })
  }

  // Get project using thread_ts
  const project = await getProjectByClientSlackThread(body.event.thread_ts)

  // Check if exists
  if (!project) {
    return slackWebClient.chat.postMessage({
      thread_ts: body.event.ts,
      channel: body.event.channel,
      text: 'Project was not found. Please use the email command in a valid project request thread.'
    })
  }

  // Check if not approved
  if (!(project.status === config.get('PROJECT_STATUS.APPROVED'))) {
    return slackWebClient.chat.postMessage({
      thread_ts: body.event.ts,
      channel: body.event.channel,
      text: 'Project has to be approved in order to invite people to it'
    })
  }

  // POST to TC central
  await rp({
    method: 'POST',
    uri: `${process.env.CENTRAL_LAMBDA_URI}/invite`,
    body: {
      projectId: project.id,
      email
    },
    json: true
  })

  // Post to Client Slack on success
  return slackWebClient.chat.postMessage({
    thread_ts: body.event.ts,
    channel: body.event.channel,
    text: `User with ${email} has been successfully invited to the project, you can access the project at Connect.`
  })
}
