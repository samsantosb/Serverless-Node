const AWS = require('aws-sdk')
const { Writable, pipeline } = require('stream')
const csvtojson = require('csvtojson')
class Handler {
    constructor({ s3Svc, sqsSvc }) {
        this.s3Svc = s3Svc
        this.sqsSvc = sqsSvc
        this.queueName = process.env.SQS_QUEUE
    }

    static getSdks() {
        const host = process.env.LOCALSTACK_HOST || "localhost"
        const s3port = process.env.S3_PORT || "4572"
        const sqsPort = process.env.SQS_PORT || "4576"
        const isLocal = process.env.IS_LOCAL
        const s3endpoint = new AWS.Endpoint(
            `http://${host}:${s3port}`
        )
        const s3config = {
            endpoint: s3endpoint,
            s3ForcePathStyle: true
        }

        const sqsEndpoint = new AWS.Endpoint(
            `http://${host}:${sqsPort}`
        )
        const sqsConfig = {
            endpoint: sqsEndpoint,
        }

        if (!isLocal) {
            delete s3config.endpoint
            delete sqsConfig.endpoint
        }
        return {
            s3: new AWS.S3(s3config),
            sqs: new AWS.SQS(sqsConfig)
        }
    }
    async getQueueUrl() {
        const { QueueUrl } = await this.sqsSvc.getQueueUrl({
            QueueName: this.queueName
        }).promise()

        return QueueUrl
    }
    processDataOnDemand(queueUrl) {
        const writableStream = new Writable({
            write: (chunk, encoding, done) => {
                const item = chunk.toString()
                console.log('sending..', item, 'at', new Date().toISOString())
                this.sqsSvc.sendMessage({
                    QueueUrl: queueUrl,
                    MessageBody: item
                }, done)
            }
        })
        return writableStream

    }
    async pipefyStreams(...args) {
        return new Promise((resolve, reject) => {
            pipeline(
                ...args,
                error => error ? reject(error) : resolve()
            )
        })
    }
    async main(event) {
        const [
            {
                s3: {
                    bucket: {
                        name
                    },
                    object: {
                        key
                    }
                }
            }
        ] = event.Records

        console.log('processing.', name, key)

        try {
            console.log('getting queueURL...')
            const queueUrl = await this.getQueueUrl()
            const params = {
                Bucket: name, Key: key
            }
            // this.s3Svc.getObject(params)
            //     .createReadStream()
            //     .pipe(csvtojson())
            //     .pipe(this.processDataOnDemand(queueUrl))

            // desta forma quem der erro primeiro para o processo
            // não precisa pegar o on(finish) para retornar o handler
            await this.pipefyStreams(
                this.s3Svc
                    .getObject(params)
                    .createReadStream(),
                csvtojson(),
                this.processDataOnDemand(queueUrl)
            )
            console.log('process finished...', new Date().toISOString())

            return {
                statusCode: 200,
                body: 'Process finished with success!'
            }
        } catch (error) {
            console.log('***error', error.stack)
            return {
                statusCode: 500,
                body: 'Internal Error'
            }
        }
    }
}
const { s3, sqs } = Handler.getSdks()
const handler = new Handler({
    sqsSvc: sqs,
    s3Svc: s3
})
module.exports = handler.main.bind(handler)