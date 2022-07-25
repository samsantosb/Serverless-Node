const Sequelize = require('sequelize')
const connection = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DATABASE
}

const sequelize = new Sequelize(
    connection.database,
    connection.user,
    connection.password,
    {
        host: connection.host,
        dialect: 'mysql',
        // case sensitive
        quoteIdentifiers: false,
        // deprecation warning
        operatorsAliases: false
    }
)

const Herois = sequelize.define('herois',
    {
        id: {
            type: Sequelize.INTEGER,
            required: true,
            primaryKey: true,
            autoIncrement: true,
        },
        nome: {
            type: Sequelize.STRING,
            required: true,
        },
        poder: {
            type: Sequelize.STRING,
            required: true,
        }
    },
    {
        tableName: 'TB_HEROIS',
        freezeTableName: false, 
        timestamps: false
    }

)

module.exports = {
    HeroiSchema: Herois,
    sequelize
}