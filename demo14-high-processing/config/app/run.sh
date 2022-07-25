IMAGE_URL="201807860611.dkr.ecr.us-east-1.amazonaws.com/process-data"
REGION="us-east-1"
docker build -t $IMAGE_URL .

docker run $IMAGE_URL

aws ecr get-login --no-include-email --region $REGION | bash

docker push $IMAGE_URL