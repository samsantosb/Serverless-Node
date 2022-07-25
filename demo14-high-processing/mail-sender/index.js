const AWS = require('aws-sdk')
const S3 = new AWS.S3()
const SES = new AWS.SES({
    region: 'us-east-1'
})

const mailcomposer = require('mailcomposer')
const { promises: { writeFile, unlink } } = require('fs')
const { promisify } = require('util')

const handler = async event => {
    console.log('received', JSON.stringify(event, null, 2), new Date().toISOString())
    const [{ s3: { bucket: { name }, object: { key } } }] = event.Records
    const params = { Bucket: name, Key: key }
    console.log('using bucket data...', JSON.stringify(params))

    console.log('downloading file...')
    const { Body: file } = await S3.getObject(params).promise()
    console.log('saving file locally')
    const pathName = `/tmp/${new Date().getTime()}-${key.replace('/', '')}`
    await writeFile(pathName, file)

    const data = {
        to: process.env.SES_EMAIL_TO,
        from: process.env.SES_EMAIL_FROM,
        subject: 'Report Generated'
    }

    const mail = mailcomposer({
        ...data,
        text: 'Body message!!. File is attached...\n\n',
        attachments: [{
            path: pathName
        }]
    })
    const message = await promisify(mail.build.bind(mail))()
    console.log('sending email...')
    const response = await SES.sendRawEmail({
        RawMessage: { Data: message }
    }).promise()

    console.log('removing tmp file...')
    await unlink(pathName)
    console.log('finishing...', JSON.stringify(response))

    return {
        statusCode: 200,
        body: JSON.stringify(response, null, 2)
    }
}

module.exports = {
    hello: handler
}