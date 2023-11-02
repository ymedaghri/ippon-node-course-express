import { Application, Request, Response } from 'express';

export default (app: Application) => {
    /**
    * @swagger
    * /protected/person:
    *   get:
    *     tags:
    *       - 🕵🏽 MI6
    *     security:
    *       - bearerAuth: []
    *     summary: Connaitre l'identité d'un agent de la couronne <Nom>.
    *     description: Toujours le même on dirait
    *     responses:
    *       200:
    *         description: un message simple.
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 message:
    *                   type: string
    */
    app.get('/protected/person', (req: Request, res: Response) => {
        res.json({ message: `James, my name is James !` });
    });
};