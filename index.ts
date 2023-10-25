import jwt from 'jsonwebtoken';
import express, { Express, Request, Response, NextFunction } from 'express'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'
import registerPersonRoute from './routes/person'
import registerSecretAgentRoute from './routes/secretAgent'

const app: Express = express(), port = 3000

const options = {
    definition: {
        openapi: '3.0.0',
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        info: {
            title: 'Mon API Express',
            version: '1.0.0',
            description: 'Une API express toute simple',
        },
        servers: [
            {
                url: `http://localhost:${port}`,
            },
        ],
    },
    apis: ['./routes/*.ts'],
};

const specs = swaggerJsdoc(options);

function monMiddlewareJWT(req: Request, res: Response, next: NextFunction) {
    const bearerHeader = req.headers['authorization'] as string | undefined;
    if (bearerHeader) {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];

        jwt.verify(bearerToken, 'superSecret^^', (err) => {
            if (err) {
                res.sendStatus(403);
            } else {
                next();
            }
        });
    } else {
        res.sendStatus(403);
    }
}
app.use('/protected', monMiddlewareJWT);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

registerPersonRoute(app)
registerSecretAgentRoute(app)

const server = app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

