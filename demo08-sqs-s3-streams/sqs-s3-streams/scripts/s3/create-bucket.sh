# bash scripts/s3/create-bucket.sh meu-bucket
BUCKET_NAME=$1
aws \
     s3 mb s3://$BUCKET_NAME \
     --endpoint-url=http://localhost:4572

aws \
     s3 ls \
     --endpoint-url=http://localhost:4572

