import express, { Express, NextFunction, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import { RegisterRoutes } from "./tsoa/routes";
import jsonSwaggerFile from "./tsoa/swagger.json"
import { ValidateError } from 'tsoa';

export const port = 3000;

export default () => {
  const app: Express = express();

  app.use(express.json());
  
  app.use("/openapi-docs", swaggerUi.serve, async (_req: Request, res: Response) => {
    return res.send(
      swaggerUi.generateHTML(jsonSwaggerFile)
    )
  });

  app.use(cors());

  RegisterRoutes(app);

  app.use(function notFoundHandler(_req, res: Response) {
    res.status(404).send({
      message: "Not Found",
    });
  });

  app.use(function errorHandler(
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
  ): Response | void {
    if (err instanceof ValidateError) {
      return res.status(422).json({
        message: "Validation Failed",
        details: err?.fields,
      });
    }
    if (err instanceof Error) {
      console.log(err.message, err.name, err.stack)
      return res.status(500).json({
        message: "Internal Server Error",
        details: err.message
      });
    }

    next();
  });

  return app;
};
