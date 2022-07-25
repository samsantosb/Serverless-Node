const privateUsers = async () => {
    // poderia obter os usuarios via dynamodb...

    return [
        'erick@erick.com',
        'ana@ana.com',
        'teste'
    ]
}

exports.private = privateUsers