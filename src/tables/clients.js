/**
 * Contains the schema for projects table
 */

const config = require('config')

const clients = {
  AttributeDefinitions: [{
    AttributeName: 'teamId',
    AttributeType: 'S'
  }],
  KeySchema: [{
    AttributeName: 'teamId',
    KeyType: 'HASH'
  }],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1
  },
  TableName: config.get('DYNAMODB.SLACK_CLIENTS_TABLE_NAME')
}

module.exports = clients
