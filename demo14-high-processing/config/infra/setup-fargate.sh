APP_NAME="process-data"
CLUSTER_NAME="curso-serverless"
PROJECT_NAME="curso-serverless01"
REGION="us-east-1"
LOG_GROUP_NAME="/ecs/$PROJECT_NAME"

ECS_ROLE_NAME="ecsTaskExecutionRole"
# from AWS IAM Policies
ECS_ROLE_ARN="arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"

CUSTOM_POLICY_NAME="$APP_NAME"-policy 
CUSTOM_POLICY_ARN="arn:aws:iam::201807860611:policy/process-data-policy"

ECR_URI_DOCKER="201807860611.dkr.ecr.us-east-1.amazonaws.com/process-data"
SSM_ENV_PATH="/prod/$PROJECT_NAME/"

TASK_DEFINITION_ARN="arn:aws:ecs:us-east-1:201807860611:task-definition/process-data:5"

VPC_ID="vpc-063b3f7c"
SECURITY_GROUP_NAME="$PROJECT_NAME"
GROUP_ID="sg-0f679f573058d71ce"


aws iam create-role \
    --region $REGION \
    --role-name $ECS_ROLE_NAME \
    --assume-role-policy-document file://templates/task-execution-assume-role.json \
    | tee logs/1.iam-create-role.txt

# dar permissao de executar chamadas ecs na role
aws iam attach-role-policy \
    --region $REGION \
    --role-name $ECS_ROLE_NAME \
    --policy-arn $ECS_ROLE_ARN 

#  permissões para a instancia acessar o S3 e variáveis de ambiente

# Permissões:
# Acessar o Bucket de surveys
# Fazer download do csv de surveys
# Fazer upload de relatório xlsx para surveys/reports
# Ler variáveis do Systems Manager Parameter Store

aws iam create-policy \
    --policy-name $CUSTOM_POLICY_NAME \
    --policy-document file://templates/custom-access-policy.json \
    | tee logs/2.create-policy.txt

# adicionar policy acima à role principal
aws iam attach-role-policy \
    --region $REGION \
    --role-name $ECS_ROLE_NAME \
    --policy-arn $CUSTOM_POLICY_ARN

# criar cluster do Elastic Container Service (ECS)
aws ecs create-cluster \
    --cluster-name $CLUSTER_NAME \
    | tee logs/3.create-cluster.txt

# criar grupo de logs especifico para o cluster
aws logs create-log-group \
    --log-group-name $LOG_GROUP_NAME \
    | tee logs/4.logs-create-log-group.txt

#  Criar container registry
aws ecr create-repository \
    --repository-name $APP_NAME \
    --image-scanning-configuration scanOnPush=true \
    --region $REGION \
    | tee logs/5.create-docker-repo.txt

# Task definition - container configuration
aws ecs register-task-definition \
    --cli-input-json file://templates/task-definition.json \
    | tee logs/6.register-task.txt

aws ecs list-task-definitions \
    | tee logs/7.tasks-definitions.txt

#  Security
aws ec2 describe-vpcs \
    | tee logs/8.describe-vpcs.txt

VPC_ID="vpc-063b3f7c"
aws ec2 describe-subnets \
    --filters="Name=vpc-id,Values=$VPC_ID" \
    --query "Subnets[*].SubnetId" \
    | tee logs/9.describe-subnets.txt

aws ec2 create-security-group \
    --group-name $SECURITY_GROUP_NAME \
    --description "grupo de acesso em ecs tasks" \
    | tee logs/10.create-security-group.txt

GROUP_ID="sg-0f679f573058d71ce"

aws ec2 authorize-security-group-ingress \
    --group-id $GROUP_ID \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0 \
    --region $REGION \
    | tee logs/11.authorize-sec-group.txt

    
# clean up

TASKS=$(
    aws ecs list-task-definitions --query "taskDefinitionArns[*]" | jq -r '.[]'
)

for i in $(printf '%s\n' "${TASKS[@]}"); do
    echo 'deregistering' $i 
    aws ecs deregister-task-definition \
        --task-definition $i
done

aws logs delete-log-group \
    --log-group-name $LOG_GROUP_NAME

aws ecs delete-cluster \
    --cluster $CLUSTER_NAME

aws ec2 delete-security-group \
    --group-name $SECURITY_GROUP_NAME

aws ecr delete-repository \
    --repository-name $APP_NAME \
    --force 

aws iam detach-role-policy \
    --region $REGION \
    --role-name $ECS_ROLE_NAME \
    --policy-arn $CUSTOM_POLICY_ARN

aws iam \
    --region $REGION \
    delete-policy \
    --policy-arn $CUSTOM_POLICY_ARN

aws iam detach-role-policy \
    --region $REGION \
    --role-name $ECS_ROLE_NAME \
    --policy-arn $ECS_ROLE_ARN

aws iam delete-role \
    --role-name $ECS_ROLE_NAME

aws ssm delete-parameters \
    --names `aws ssm get-parameters-by-path --path "$SSM_ENV_PATH" --query "Parameters[*].Name" --output text --max-items 9`

aws s3 rm s3://surveys-erick-001 --recursive