/**
 * Helper functions to communicate with Dynamodb
 */

const AWS = require('aws-sdk')
const config = require('config')

let documentClient = null

/**
 * Create tasks table and initialize DocumentClient
 */
async function initialize () {
  AWS.config.update({
    region: process.env.REGION,
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    endpoint: process.env.DYNAMODB_ENDPOINT
  })

  documentClient = new AWS.DynamoDB.DocumentClient()
}

/**
 * Returns an instance of DocumentClient
 */
async function getDocumentClient () {
  if (!documentClient) {
    return initialize()
  }
}

/**
 * Create an item in Dynamodb
 * @param {Object} params
 */
async function put (params) {
  await getDocumentClient()
  return documentClient.put(params).promise()
}

/**
 * Query for item from Dynamodb table
 * @param {Object} params
 */
async function query (params) {
  await getDocumentClient()
  return documentClient.query(params).promise()
}

/**
 * Update an item in Dynamodb table
 * @param {Object} params
 */
async function update (params) {
  await getDocumentClient()
  return documentClient.update(params).promise()
}

/**
 * Get a project by id
 * @param {String} projectId
 */
async function getProject (projectId) {
  return ((await query({
    TableName: config.get('DYNAMODB.PROJECT_TABLE_NAME'),
    KeyConditionExpression: 'id = :idVal',
    ExpressionAttributeValues: {
      ':idVal': projectId
    }
  })).Items[0])
}

/**
 * Updates project status
 * @param {String} projectId
 * @param {String} newStatus
 */
async function updateProjectStatus (projectId, newStatus) {
  return update({
    TableName: config.get('DYNAMODB.PROJECT_TABLE_NAME'),
    Key: {
      id: projectId
    },
    UpdateExpression: 'set #st = :s',
    ExpressionAttributeValues: {
      ':s': newStatus
    },
    ExpressionAttributeNames: {
      '#st': 'status'
    }
  })
}

/**
 * Get project by the thread that it was launched in by the client
 * @param {String} clientSlackThread
 */
async function getProjectByClientSlackThread (clientSlackThread) {
  return ((await query({
    TableName: config.get('DYNAMODB.PROJECT_TABLE_NAME'),
    IndexName: config.get('DYNAMODB.CLIENT_SLACK_THREAD_INDEX'),
    KeyConditionExpression: 'clientSlackThread = :c',
    ExpressionAttributeValues: {
      ':c': clientSlackThread
    }
  })).Items[0])
}

/**
 * Returns the client by team id
 * @param {String} teamId
 */
async function getClientByTeamId (teamId) {
  return ((await query({
    TableName: config.get('DYNAMODB.SLACK_CLIENTS_TABLE_NAME'),
    KeyConditionExpression: 'teamId = :teamIdVal',
    ExpressionAttributeValues: {
      ':teamIdVal': teamId
    }
  })).Items[0])
}

module.exports = {
  put,
  query,
  update,
  getProject,
  updateProjectStatus,
  getProjectByClientSlackThread,
  getClientByTeamId
}
