const users = require('./../db/users.json')
const JWT_KEY = process.env.JWT_KEY
const { sign } = require('jsonwebtoken')
const login = async event => {
    console.log('Login invoked!..', new Date().toISOString(), event.body)

    const {
        username,
        password
    } = JSON.parse(event.body)
    // do validations!!! 

    const validUser = users.find(
        user => 
            user.username.toLowerCase() === username.toLowerCase() &&
            user.password === password
    )

    if(!validUser) {
        return {
            statusCode: 401,
            body: JSON.stringify({
                message: 'Unauthorized'
            })
        }
    }

    const signUser = {
        scopes: validUser.scopes,
        username: validUser.username
    }

    const token = sign({
        user: signUser,
        // 5 minutos
    }, JWT_KEY, { expiresIn: '5m'})

    return {
        statusCode: 200,
        body: JSON.stringify({
            token
        })
    }
}

exports.handler = login