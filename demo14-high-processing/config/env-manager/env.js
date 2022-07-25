
const ssmPrefix = "/prod/curso-serverless01"
 
const variables = {

    ECS_TASK_DEFINITION: {
        value: "process-data:5",
        type: "String"
    },
    ECS_CLUSTER_NAME: {
        value: "curso-serverless",
        type: "String"
    },
    ECS_TASK_LAUNCH_TYPE: {
        value: "FARGATE",
        type: "String"
    },
    ECS_TASK_COUNT: {
        value: "1",
        type: "String"
    },
    ECS_TASK_PLATFORM_VERSION: {
        value: "LATEST",
        type: "String"
    },
    ECS_TASK_CONTAINER_NAME: {
        value: "process-data",
        type: "String"
    },
    ECS_TASK_CONTAINER_FILE_ENV_NAME: {
        value: "SURVEY_FILE",
        type: "String"
    },
    ECS_TASK_SUBNETS: {
        value: [
            "subnet-819563a0",
            "subnet-23fd466e",
            "subnet-34298b3a",
            "subnet-184f7026",
            "subnet-8f4abfd0",
            "subnet-cad33bac"
        ].join(','),
        type: "StringList"
    },
    ECS_TASK_SECURITY_GROUPS: {
        value: [
            "sg-0f679f573058d71ce"
        ].join(','),
        type: "StringList"
    },
    ECS_TASK_ASSIGN_PUBLIC_IP: {
        value: "ENABLED",
        type: "String"
    },
    ECS_PROCESS_DATA_IMAGE_URL: {
        value: "201807860611.dkr.ecr.us-east-1.amazonaws.com/process-data",
        type: "String"
    },
    BUCKET_REPORTS: {
        value: "reports",
        type: "String"
    },
    LOG_GROUP_NAME: {
        value: "/ecs/curso-serverless01",
        type: "String"
    },
    SSM_PREFIX: {
        value: ssmPrefix,
        type: "String"
    },
    BUCKET_SURVEYS: {
        value: "surveys-erick-001",
        type: "String"
    },
    REGION: {
        value: "us-east-1",
        type: "String"
    },
    SES_EMAIL_TO: {
        value: "ew.treinamentos01@gmail.com",
        type: "String"
    },
    SES_EMAIL_FROM: {
        value: "ew.treinamentos01@gmail.com",
        type: "String"
    },

}

module.exports = {
    variables,
    ssmPrefix
}