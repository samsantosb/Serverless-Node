# 1o passo criar arquivo de politicas de seguranca
# 2o criar role de segurança na AWS

aws iam create-role \
    --role-name lambda-exemplo \
    --assume-role-policy-document file://politicas.json \
    | tee logs/role.log

#3o criar arquivo com conteudo e zipa-lo
zip function.zip index.js

aws lambda create-function \
    --function-name hello-cli \
    --zip-file fileb://function.zip \
    --handler index.handler \
    --runtime nodejs12.x \
    --role arn:aws:iam::201807860611:role/lambda-exemplo \
    | tee logs/lambda-create.log

#4o invoke lambda! 
aws lambda invoke \
    --function-name hello-cli \
    --log-type Tail \
    logs/lambda-exec.log

# -- atualizar, zipar
zip function.zip index.js

# atualizar lambda
aws lambda update-function-code \
    --zip-file fileb://function.zip \
    --function-name hello-cli \
    --publish \
    | tee logs/lambda-update.log

#invokar e ver resultado
aws lambda invoke \
    --function-name hello-cli \
    --log-type Tail \
    logs/lambda-exec-update.log
#remover
aws lambda delete-function \
    --function-name hello-cli 

aws iam delete-role \
    --role-name lambda-exemplo 