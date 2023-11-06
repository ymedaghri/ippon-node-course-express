// src/users/usersController.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Path,
  Post,
  Route,
  SuccessResponse,
  Tags,
} from "tsoa";

import { MongoDatabaseRepository, mongoDatabaseRepository } from '../repositories';
import { iocContainer } from "../tsoa/ioc";
import { Category, Prisma, Status } from "../../database-mongo/prisma/generated/client-mongo";

interface KanbanProject {
  id: string;
  name: string;
}

type KanbanProjectCreationParams = Pick<KanbanProject, "name">;

interface CountObject {
  count: number;
}

interface DetailsObject {
  id: string;
  name: string;
}

type MyArrayType = (CountObject | DetailsObject)[];

interface Ticket {
  id: string
  code: string
  description: string
  status: Status
  category: Category
  projectId: string | null
}

type TicketCreationParams = Omit<Ticket, "id" | "projectId">;


@Route("kanban-projects")
@Tags("📊 Kanban")
export class KanbanEndpoints extends Controller {
  constructor(private mongoDatabaseRepository: MongoDatabaseRepository) {
    super();
  }

  /**
   * Création d'un nouveau projet kanban vide (sans aucun ticket)
   * @summary Créé un nouveau projet kanban.
   */
  @SuccessResponse("201", "Created")
  @Post("")
  public async createAKanbanProject(
    @Body() requestBody: KanbanProjectCreationParams
  ): Promise<KanbanProject> {

    const { name } = requestBody;
    const project = await this.mongoDatabaseRepository.createProject(name);

    this.setStatus(201);

    return project
  }

  /**
   * Suppression d'un projet kanban et de tous ses tickets associés.
   * @summary Supprime nouveau projet kanban et ses tickets.
   */
  @Delete("{projectId}")
  public async deleteAKanbanProject(
    @Path() projectId: string,
  ): Promise<MyArrayType> {

    const deletedProject = await this.mongoDatabaseRepository.deleteProject(projectId);
    this.setStatus(200);

    return deletedProject
  }

  /**
   * Récupèration tous les projets kanban et leurs tickets associés.
   * @summary Récupère tous les projets kanban et leurs tickets associés.
   */
  @Get()
  public async gelAllKanbanProjects(): Promise<KanbanProject[]> {

    const projects = await this.mongoDatabaseRepository.getAllProjects();
    this.setStatus(200);

    return projects
  }

  /**
   * Création d'un ticket au sein d'un projet kanban.
   * @summary Créé un ticket au sein d'un projet kanban.
   */
  @SuccessResponse("201", "Created")
  @Post("{projectId}/tickets")
  public async createATicketForAKanbanProject(
    @Path() projectId: string,
    @Body() requestBody: TicketCreationParams
  ): Promise<Ticket> {

    const { code, description, status, category } = requestBody;

    try {
      const ticket = await this.mongoDatabaseRepository.createTicket({
        code,
        description,
        status: status,
        category: category,
        projectId,
      });
      this.setStatus(201);
      return ticket
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error(`Violation de contrainte d'unicité : ${error.meta?.target}`)
        }
      }
      throw new Error("Une erreur est survenue durant l'enregistrement en base de donnée")
    }
  }

  /**
   * Suppression d'un ticket au sein d'un projet kanban.
   * @summary Supprime un ticket au sein d'un projet kanban.
   */
  @Delete("{projectId}/tickets/{ticketId}")
  public async deleteATicketOfAKanbanProject(
    @Path() projectId: string, ticketId: string
  ): Promise<Ticket> {

    const deletedProject = await this.mongoDatabaseRepository.deleteTicket(ticketId, projectId);
    this.setStatus(200);

    return deletedProject
  }

}

iocContainer.set(KanbanEndpoints, new KanbanEndpoints(mongoDatabaseRepository))