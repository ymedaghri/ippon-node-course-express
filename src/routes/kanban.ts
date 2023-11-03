import { Application, Request, Response } from 'express';
import { repositories } from '../repositories';
import {
  Category,
  Prisma,
  Status,
} from '../../database-mongo/prisma/generated/client-mongo';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export default (app: Application, repositories: repositories) => {
  /**
   * @swagger
   * /kanban-projects:
   *   post:
   *     tags:
   *       - 📊 Kanban
   *     summary: Create a new kanban project.
   *     description: Create a new kanban project.
   *     requestBody:
   *       required: true
   *       content:
   *           application/json:
   *             schema:
   *               type: object
   *               required:
   *                 - name
   *               properties:
   *                 name:
   *                   type: string
   *     responses:
   *       201:
   *         description: A new kanban project.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                 name:
   *                   type: string
   *       400:
   *         description: Bad request.Missing or invalid parameters.
   */
  app.post('/kanban-projects', async (req: Request, res: Response) => {
    const { name } = req.body;

    try {
      checkRequiredString('name', name);
    } catch (error: unknown) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : '',
      });
    }

    const project = await repositories.mongoRepository.createProject(name);
    res.status(201).json(project);
  });

  app.delete(
    '/kanban-projects/:projectId',
    async (req: Request, res: Response) => {
      const { projectId } = req.params;

      const deletedProject =
        await repositories.mongoRepository.deleteProject(projectId);
      res.status(200).json(deletedProject);
    }
  );

  /**
   * @swagger
   * /kanban-projects:
   *   get:
   *     tags:
   *       - 📊 Kanban
   *     summary: Get all kanban projects.
   *     description: Get all kanban projects.
   *     responses:
   *       200:
   *         description: A list of kanban projects with their associated tickets.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                 name:
   *                   type: string
   *       400:
   *         description: Bad request.Missing or invalid parameters.
   */
  app.get('/kanban-projects', async (req: Request, res: Response) => {
    const projects = await repositories.mongoRepository.getAllProjects();
    res.status(200).json(projects);
  });

  /**
   * @swagger
   * /kanban-projects/{projectId}/tickets:
   *   post:
   *     tags:
   *       - 📊 Kanban
   *     summary: Create a new ticket associated to a kanban project.
   *     description: Create a new ticket associated to a kanban project.
   *     parameters:
   *       - in: path
   *         name: projectId
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *           application/json:
   *             schema:
   *               type: object
   *               required:
   *                 - name
   *                 - status
   *               properties:
   *                 name:
   *                   type: string
   *                 status:
   *                   type: string
   *                   enum: ['TODO', 'DOING', 'DONE']
   *     responses:
   *       201:
   *         description: A new kanban project.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                 name:
   *                   type: string
   *                 status:
   *                   type: string
   *                   enum: ['TODO', 'DOING', 'DONE']
   *                 projectId:
   *                   type: string
   *       400:
   *         description: Bad request.Missing or invalid parameters.
   */
  app.post(
    '/kanban-projects/:projectId/tickets',
    async (req: Request, res: Response) => {
      const { code, description, status, category } = req.body;
      const { projectId } = req.params;

      try {
        checkRequiredString('code', code);
        checkRequiredString('description', description);
        checkRequiredString('status', status, Status);
        checkRequiredString('category', category, Category);
      } catch (error: unknown) {
        return res.status(400).json({
          error: error instanceof Error ? error.message : '',
        });
      }

      const statusEnum = status as Status;
      const categoryEnum = category as Category;
      try {
        const ticket = await repositories.mongoRepository.createTicket({
          code,
          description,
          status: statusEnum,
          category: categoryEnum,
          projectId,
        });
        res.status(201).json(ticket);
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            res
              .status(500)
              .json({
                erreur: `Violation de contrainte d'unicité : ${error.meta?.target}`,
              });
          }
        } else {
          res
            .status(500)
            .json({
              erreur:
                "Un erreur est survenue durant l'enregistrement en base de donnée",
            });
        }
      }
    }
  );

  app.delete(
    '/kanban-projects/:projectId/tickets/:ticketId',
    async (req: Request, res: Response) => {
      const { projectId, ticketId } = req.params;

      const deletedTicket = await repositories.mongoRepository.deleteTicket(
        ticketId,
        projectId
      );
      res.status(200).json(deletedTicket);
    }
  );
};

const checkRequiredString = <T>(
  propertyName: string,
  value: string,
  enumeration?: T
) => {
  if (enumeration) {
    if (
      typeof value !== 'string' ||
      value.trim() === '' ||
      value == null ||
      !Object.values(enumeration).includes(value as T)
    ) {
      throw new Error(
        `A "${propertyName}" property of type enum [${Object.values(
          enumeration
        ).join(',')}] is required in the request body.`
      );
    }
  }
  if (typeof value !== 'string' || value.trim() === '' || value == null) {
    throw new Error(
      `A "${propertyName}" property of type string is required in the request body.`
    );
  }
};
