'use strict';

const { ApolloServer, gql } = require('apollo-server-lambda');
const setupDynamoDBClient = require('./src/core/util/setupDynamoDB')
setupDynamoDBClient()

const HeroFactory = require('./src/core/factories/heroFactory')
const SkillFactory = require('./src/core/factories/skillFactory')

const isLocal = process.env.IS_LOCAL

const schema = require('./src/graphql')

const server = new ApolloServer({
  schema ,
  context: async() => ({
    Hero: await HeroFactory.createInstance(),
    Skill: await SkillFactory.createInstance()
  }),
  // permitir execucao no frontend e obtencao dos schemas
  introspection: isLocal,
  // frontend
  playground: isLocal,
  formatError(error) {
    console.error('[Global error logger]', error)
    return error
  },
  formatResponse(response) {
    console.log('[Global logger]', response)
    return response
  }
});

exports.handler = server.createHandler({
  cors: {
    origin: '*', 
  },
});

// async function main() {
//   console.log('creating factories..')
//   const skillFactory = await SkillFactory.createInstance()
//   const heroFactory = await HeroFactory.createInstance()

//   console.log('inserting skill item')
//   const skillId = `${new Date().getTime()}`
//   await skillFactory.create({
//     id: skillId,
//     name: 'mage',
//     value: 50
//   })
//   console.log('getting skil item')
//   const skillItem = await skillFactory.findOne(skillId)
//   console.log('skillItem', skillItem)

//   const allSkills = await skillFactory.findAll()
//   console.log('allSkills', allSkills)

//   console.log('\n------------\n')

//   console.log('inserting hero item')
//   const heroId = `${new Date().getTime()}`
//   await heroFactory.create({
//     id: heroId,
//     name: 'Batman',
//     skills: [skillId]
//   })

//   const hero = await heroFactory.findOne(heroId)
//   console.log('hero', hero)

//   const allHeroes = await heroFactory.findAll()
//   console.log('allHeroes', allHeroes)

//   return {
//     statusCode: 200,
//     body: JSON.stringify({
//       hero: {
//         hero,
//         allHeroes
//       },
//       skill: {
//         skillItem,
//         allSkills
//       }
//     })
//   }

// }

// module.exports.test = main