const dynamoose = require('dynamoose')

function setupDynamoDBClient() {
    if (!process.env.IS_LOCAL)
        return;
    
    const host = process.env.LOCALSTACK_HOST
    const port = process.env.DYNAMODB_PORT

    console.log('running locally', host, port)
    dynamoose.local(`http://${host}:${port}`)
}

module.exports = setupDynamoDBClient