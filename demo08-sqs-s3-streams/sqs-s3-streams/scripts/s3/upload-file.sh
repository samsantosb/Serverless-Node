BUCKETNAME=$1
FILE_PATH=$2

aws \
    s3 cp $FILE_PATH s3://$BUCKETNAME \
    # --endpoint-url=http://localhost:4572
aws \
    s3 ls s3://$BUCKETNAME \
    # --endpoint-url=http://localhost:4572
