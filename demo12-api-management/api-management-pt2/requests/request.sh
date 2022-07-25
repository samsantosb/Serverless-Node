HOST=http://localhost:3000
HOST="https://19sr45haxd.execute-api.us-east-1.amazonaws.com"
APIKEY="d41d8cd98f00b204e9800998ecf8427e"
APIKEY="qABn4UqB8v1Xc4C0hqfI299vx87IejiU4vOz3FQG"
echo "Press <CTRL + C> to exit"
while :
do 
    curl --silent \
        -H "x-api-key: $APIKEY" \
        $HOST/dev/hello
done

curl --silent \
    $HOST/dev/getUsagePlans | tee getUsagePlans.log 

# from getUsagePlans
USAGE_PLAN_ID="hb238x"
KEYID=n5tlfiw492
APIKEY="vQ7d2a92ozauVjfUxGBde6H4DaqeVsgt8e0ZpKz0"
FROM="2020-04-23"
TO="2020-04-24"

curl --silent \
    "$HOST/dev/getUsage?keyId=$KEYID&usagePlanId=$USAGE_PLAN_ID&from=$FROM&to=$TO" \
    | tee usage.log