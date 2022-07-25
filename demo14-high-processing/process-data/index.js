const csvtojson = require('csvtojson')
const XLSXChart = require("xlsx-chart");
const chart = new XLSXChart()
const AWS = require('aws-sdk')
const S3 = new AWS.S3()
const assert = require('assert')

const { createReadStream, promises: { readFile} } = require('fs')
const { Transform, Writable, pipeline } = require('stream')
const { promisify } = require('util')
const pipelineAsync = promisify(pipeline)


const processDataStream = (salaryTypes, finalData) => new Writable({
    write: (chunk, encoding, cb) => {
        const item = JSON.parse(chunk)
        console.log('Respondent', item.Respondent)
        if (item.SalaryType === "NA") {
            return cb()
        }

        finalData.titles.push(item.SalaryType)
        finalData.fields.push(item.Country)

        if (!salaryTypes[item.SalaryType]) {
            // na primeira vez, cria o objeto para a agregacao
            /**
             {
                 Monthly: {}
                 Annual: {}
                 Weekly: {}
             }
             */
            salaryTypes[item.SalaryType] = {}
        }

        if (!salaryTypes[item.SalaryType][item.Country]) {
            // inicializa pais
            /*
            {
                Monthly: {
                    Brasil: 1,
                }
                Annual: {
                    Argentina: 1,
                }
                Weekly: {
                    Colombia: 1
                }
            }

            */
            salaryTypes[item.SalaryType][item.Country] = 1
            // modifica a instancia e nao retorna nada
            return cb()
        }

        // incrementa todo valor novo
        salaryTypes[item.SalaryType][item.Country] += 1

        cb()
    }
})

const mapStream = elapsedBytes => {
    return new Transform({
        objectMode: true,
        transform: (chunk, encoding, cb) => {
            elapsedBytes.count += chunk.length
            const item = JSON.parse(chunk)
            const data = JSON.stringify({
                Country: item.Country,
                SalaryType: item.SalaryType,
                Respondent: item.Respondent
            })

            return cb(null, data)
        }
    })
}


const generateFile = async (finalData, salaryTypes) => {
    const id = new Date().getTime()
    const opts = {
        file: `chart-${id}.xlsx`,
        chart: "column",
        titles: [...new Set(finalData.titles)].sort(),
        fields: [...new Set(finalData.fields)].sort(),
        data: salaryTypes
    }

    const writeFileAsync = promisify(chart.writeFile.bind(chart))
    await writeFileAsync(opts)
    return {
        filename: opts.file
    }

}

const formatBytes = (bytes, decimals = 2) => {
    if(bytes === 0) return "0 Bytes"

    const key = 1024
    const decimalsValue = decimals < 0 ? 0 : decimals
    const sizes = [
        "Bytes", "KB", "MB", "GB", "TB", "PB"
    ]
    const unities = Math.floor(Math.log(bytes) / Math.log(key))
    return parseFloat((bytes / Math.pow(key, unities)).toFixed(decimalsValue)) + " " + sizes[unities]

}

async function main() {
    console.log('starting at..', new Date().toISOString())
    
    
    const reportsFolder = process.env.BUCKET_REPORTS
    assert.ok(reportsFolder, ' env BUCKET_REPORTS is required!!')

    const surveyFile = process.env.SURVEY_FILE
    assert.ok(reportsFolder, ' env SURVEY_FILE is required!!')

    const data = JSON.parse(surveyFile)


    console.time('elapsed time')
    const elapsedBytes = { count: 0 }
    const refSalaryTypes = {}
    const refFinalData = {
        fields: [],
        titles: [],
    }

    console.log('downloading file on demand...')
    const fileStream = S3.getObject(data).createReadStream()

    // const fileStream = createReadStream('./../survey_results_public.csv')
    await pipelineAsync(
        fileStream,
        csvtojson(),
        mapStream(elapsedBytes),
        processDataStream(refSalaryTypes, refFinalData)
    )

    console.log('salaryTypes', refSalaryTypes)
    const { filename } = await generateFile(refFinalData, refSalaryTypes)
    console.log('filename', filename)
    console.log('elapsedBytes', formatBytes(elapsedBytes.count))
    const s3response = await S3.putObject({
        Body: await readFile(filename),
        Key: filename,
        Bucket: `${data.Bucket}/${reportsFolder}`
    }).promise()

    console.timeEnd('elapsed time')
    console.log('s3response', JSON.stringify(s3response))
    console.log('finished at...', new Date().toISOString())

}
// 
// process.env.SURVEY_FILE = JSON.stringify({
//     Bucket: 'surveys-erick-001',
//     Key: 'survey_results_public.csv'
// })
// process.env.BUCKET_REPORTS = 'reports'

main()