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
  // Supported messaging platforms
  PLATFORMS: {
    SLACK: 'slack'
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
    SLACK_CLIENTS_TABLE_NAME: 'slack_clients',
    CLIENT_SLACK_THREAD_INDEX: 'client_slack_thread_index',
    TEAMS_CONVERSATION_ID_INDEX: 'teams_conversation_id_index'
  },
  // Winston log level
  LOG_LEVEL: 'error',
  DISABLE_LAMBDA_DEBUG_LOGGING: false,
  // Common constants
  CONSTANTS: {
    PROJECT_DOES_NOT_EXIST: 'Project does not exist'
  },
  // Topcoder Connect configurations
  CONNECT: {
    PROJECT_URI: (projectId) => `https://connect.topcoder-dev.com/projects/${projectId}`
  }
}
