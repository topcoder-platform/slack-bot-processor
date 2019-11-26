/**
 * Application configuration options
 */

module.exports = {
  // Status of a task during its lifetime
  PROJECT_STATUS: {
    LAUNCHED: 'LAUNCHED',
    ACCEPTED: 'ACCEPTED',
    DECLINED: 'DECLINED',
    APPROVED: 'APPROVED',
    RESPONDED: 'RESPONDED'
  },
  // Supported commands received as events
  COMMANDS: {
    REQUEST: 'request',
    HELP: 'help',
    EMAIL: 'email'
  },
  // Names of interactive components
  INTERACTIVE_MESSAGE_TYPES: {
    ACCEPT: 'accept',
    DECLINE: 'decline'
  },
  // Dynamodb table and index names
  DYNAMODB: {
    PROJECT_TABLE_NAME: 'projects',
    CLIENT_SLACK_THREAD_INDEX: 'client_slack_thread_index'
  },
  // Winston log level
  LOG_LEVEL: 'error',
  // Common constants
  CONSTANTS: {
    PROJECT_DOES_NOT_EXIST: 'Project does not exist'
  }
}
