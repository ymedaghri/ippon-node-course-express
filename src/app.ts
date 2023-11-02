import express, { Express } from 'express'
import swaggerUi from 'swagger-ui-express'
import registerAllRoutes from './routes/index'
import cors from 'cors'
import { repositories } from './repositories';
import swaggerSpecsProvider from './swaggerConfiguration'
import { monMiddlewareJWT } from './middlewaresConfiguration'

export const port = 3000

export default (repositories: repositories) => {

    const app: Express = express()

    app.use('/protected', monMiddlewareJWT);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecsProvider(port)));
    app.use(cors());

    registerAllRoutes(app, repositories)

    return app
}
