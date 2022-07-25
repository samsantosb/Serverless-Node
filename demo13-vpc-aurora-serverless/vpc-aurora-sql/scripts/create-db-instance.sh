CLUSTER_NAME=serverlesscourse
USERNAME=erickwendel
PASSWORD=abc12354
DB_NAME=heroes
SECRET_NAME=autora-secret01

RESOURCE_ARN=arn:aws:rds:us-east-1:201807860611:cluster:serverlesscourse
SECRET_ARN=arn:aws:secretsmanager:us-east-1:201807860611:secret:autora-secret01-Izajub

aws rds create-db-cluster \
    --engine-version 5.6.10a \
    --db-cluster-identifier $CLUSTER_NAME \
    --engine-mode serverless \
    --engine aurora \
    --master-username $USERNAME \
    --master-user-password $PASSWORD \
    --scaling-configuration MinCapacity=2,MaxCapacity=4,AutoPause=false,TimeoutAction=ForceApplyCapacityChange \
    --enable-http-endpoint \
    --region us-east-1 \
    | tee rds-cluster.txt

CREATING="creating"
STATUS=$CREATING

while [ $STATUS == $CREATING ]
do
    STATUS=$(aws rds describe-db-clusters \
        --db-cluster-identifier $CLUSTER_NAME \
        --query 'DBClusters[0].Status' \
        | tee rds-status.txt
    )
    echo $STATUS
    sleep 1
done

aws secretsmanager create-secret \
    --name $SECRET_NAME \
    --description "Credentials for aurora serverless db" \
    --secret-string '{"username": "'$USERNAME'", "password": "'$PASSWORD'"}' \
    --region us-east-1 \
    | tee secret.txt

aws rds-data execute-statement \
    --resource-arn $RESOURCE_ARN \
    --secret-arn $SECRET_ARN \
    --database mysql \
    --sql "show databases;" \
    --region us-east-1 \
    | tee cmd-show-dbs.txt

aws rds-data execute-statement \
    --resource-arn $RESOURCE_ARN \
    --secret-arn $SECRET_ARN \
    --database mysql \
    --sql "CREATE DATABASE $DB_NAME;" \
    --region us-east-1 \
    | tee cmd-create-db.txt

aws rds describe-db-subnet-groups \
    | tee db-subnets.txt

aws secretsmanager delete-secret \
    --secret-id $SECRET_NAME \
    | tee secret-delete.txt

aws rds delete-db-cluster \
    --db-cluster-identifier $CLUSTER_NAME \
    --skip-final-snapshot \
    | tee rds-delete.cluster.txt