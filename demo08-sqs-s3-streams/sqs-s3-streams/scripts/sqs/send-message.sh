# https://sqs.us-east-1.amazonaws.com/201807860611/file-handler
QUEUE_URL=$1
echo 'Sending message' $QUEUE_URL

aws \
    sqs send-message \
    --queue-url $QUEUE_URL \
    --message-body 'Hey ho lets go' \
    # --endpoint-url=http://localhost:4576

# aws \
#     sqs receive-message \
#     --queue-url $QUEUE_URL \
#     --endpoint-url=http://localhost:4576