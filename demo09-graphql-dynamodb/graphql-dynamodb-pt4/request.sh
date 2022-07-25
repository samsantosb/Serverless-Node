URL=https://xtfge95bnl.execute-api.us-east-1.amazonaws.com/dev/graphql
URL=http://localhost:3000/dev/graphql
curl  $URL \
    -H 'Content-Type: application/json' \
    --data-binary '{"query":"mutation {\n  createHero,\n  createSkill\n}"}' --compressed


curl $URL \
    -H 'Content-Type: application/json'  \
    --data-binary '{"query":"{\n  getHero,\n  getSkill\n}"}' --compressed