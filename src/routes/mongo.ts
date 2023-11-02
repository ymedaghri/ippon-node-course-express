import { Application, Request, Response } from 'express';
import { repositories } from '../repositories';

export default (app: Application, repositories: repositories) => {
    /**
    * @swagger
    * /new-user:
    *   post:
    *     tags:
    *       - 📊 Kanban
    *     summary: Create a new project.
    *     description: Create a new project.
    *     responses:
    *       200:
    *         description: un message simple.
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 board:
    *                   type: array
    *                   items:
    *                     type: number
    *                     enum: [0, 1, 2]
    */
    app.post('/new-user', async (req: Request, res: Response) => {

        const user = await repositories.mongoRepository.createUser()
        res.status(201).json(user);
    });
}