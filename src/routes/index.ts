import { repositories } from '../repositories';
import { Express } from 'express';
import registerMeteoRoute from './meteo';
import registerPersonRoute from './person';
import registerSecretAgentRoute from './secretAgent';
import registerTicTacToeRoute from './tictactoe';
import registerKanbanRoute from './kanban';

export default (app: Express, repositories: repositories) => {
  registerMeteoRoute(app);
  registerPersonRoute(app);
  registerMeteoRoute(app);
  registerSecretAgentRoute(app);
  registerTicTacToeRoute(app);
  registerKanbanRoute(app, repositories);
};
