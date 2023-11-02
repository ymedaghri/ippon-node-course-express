import { repositories } from '../repositories';
import { Express } from 'express'
import registerMeteoRoute from './meteo'
import registerMongoRoute from './mongo'
import registerPersonRoute from './person'
import registerSecretAgentRoute from './secretAgent'
import registerTicTacToeRoute from './tictactoe'

export default (app: Express, repositories: repositories) => {
    registerMeteoRoute(app)
    registerMongoRoute(app, repositories)
    registerPersonRoute(app)
    registerMeteoRoute(app)
    registerSecretAgentRoute(app)
    registerTicTacToeRoute(app)
};