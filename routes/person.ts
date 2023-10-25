import { Application, Request, Response } from 'express';

export default (app: Application) => {
    /**
    * @swagger
    * /person/{nom}:
    *   get:
    *     summary: Recevoir un Hello World <Nom>.
    *     description: Toujours le fameux Hello world.
    *     parameters:
    *       - in: path
    *         name: nom
    *         schema:
    *           type: string
    *           required: true
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
    app.get('/person/:nom', (req: Request, res: Response) => {
        res.json({ message: `Hello World ${req.params.nom} !` });
    });
};