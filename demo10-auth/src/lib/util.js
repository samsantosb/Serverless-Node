const buildIAMPolicy = (userId, effect, resource, context)  => {
    const policy = {
        principalId: userId,
        policyDocument: {
            Statement: [{
                Action: 'execute-api:Invoke',
                // Allow | Deny
                Effect: effect,
                // arn
                Resource: resource
            }]
        },
        // response context
        context
    }
    return policy
}
module.exports = {
    buildIAMPolicy
}