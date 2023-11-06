import { expect, describe, test, afterAll, beforeEach } from 'vitest';
import { databaseRepositories, mongoPrismaClient } from './repositories';
import {
  Category,
  Status,
} from '../database-mongo/prisma/generated/client-mongo';

describe(`Tests de Repositories : mongoRepository`, () => {
  beforeEach(async () => {
    await mongoPrismaClient.ticket.deleteMany();
    await mongoPrismaClient.project.deleteMany();
  });
  afterAll(async () => {
    await mongoPrismaClient.ticket.deleteMany();
    await mongoPrismaClient.project.deleteMany();
  });

  test('should create a project in the database', async () => {
    // When
    const { mongoRepository } = databaseRepositories;
    const project = await mongoRepository.createProject('Antares XV');

    const projectFromDb = await mongoPrismaClient.project.findUnique({
      where: {
        id: project.id,
      },
    });

    // Then
    expect(project).toStrictEqual(projectFromDb);
  });

  test('should create a project and tickets related to it in the database', async () => {
    // When
    const { mongoRepository } = databaseRepositories;
    const project = await mongoRepository.createProject('Antares XVI');
    const ticket_1 = await mongoRepository.createTicket({
      code: 'ANT-1',
      description: 'Plongée pour inventaire de coraux',
      status: Status.TODO,
      category: Category.ETUDE_FONDS_MARINS,
      projectId: project.id,
    });
    const ticket_2 = await mongoRepository.createTicket({
      code: 'ANT-2',
      description: 'Étude acoustique de chants de cétacés',
      status: Status.DONE,
      category: Category.BIOLOGIE_MARINE,
      projectId: project.id,
    });

    const projectFromDb = await mongoPrismaClient.project.findUnique({
      where: { id: project.id },
      include: { tickets: true },
    });

    // Then
    expect(projectFromDb).toStrictEqual({
      ...project,
      tickets: [ticket_1, ticket_2],
    });
  });

  test('should retrieve all projects and their related tickets from the database', async () => {
    // Given
    const { mongoRepository } = databaseRepositories;

    const antares_1_project = await mongoPrismaClient.project.create({
      data: {
        name: 'Antares I',
      },
    });
    const antares_2_project = await mongoPrismaClient.project.create({
      data: {
        name: 'Antares II',
      },
    });
    const ticket_1_Antares_1_project = await mongoPrismaClient.ticket.create({
      data: {
        code: 'ANT-12',
        description: 'Plongée pour inventaire de coraux',
        status: Status.DOING,
        category: Category.ETUDE_FONDS_MARINS,
        projectId: antares_1_project.id,
      },
    });
    const ticket_2_Antares_1_project = await mongoPrismaClient.ticket.create({
      data: {
        code: 'ANT-25',
        description: 'Étude acoustique de chants de cétacés',
        status: Status.TODO,
        category: Category.BIOLOGIE_MARINE,
        projectId: antares_1_project.id,
      },
    });

    // When
    const projects = await mongoRepository.getAllProjects();

    // Then
    expect(projects).toStrictEqual([
      {
        ...antares_1_project,
        tickets: [ticket_1_Antares_1_project, ticket_2_Antares_1_project],
      },
      { ...antares_2_project, tickets: [] },
    ]);
  });

  test('should delete a ticket from the database', async () => {
    // Given
    const { mongoRepository } = databaseRepositories;

    const antares_1_project = await mongoPrismaClient.project.create({
      data: {
        name: 'Antares I',
      },
    });
    await mongoPrismaClient.project.create({
      data: {
        name: 'Antares II',
      },
    });
    const ticket_1_Antares_1_project = await mongoPrismaClient.ticket.create({
      data: {
        code: 'ANT-12',
        description: 'Plongée pour inventaire de coraux',
        status: Status.DOING,
        category: Category.ETUDE_FONDS_MARINS,
        projectId: antares_1_project.id,
      },
    });
    const ticket_2_Antares_1_project = await mongoPrismaClient.ticket.create({
      data: {
        code: 'ANT-25',
        description: 'Étude acoustique de chants de cétacés',
        status: Status.TODO,
        category: Category.BIOLOGIE_MARINE,
        projectId: antares_1_project.id,
      },
    });

    // When
    await mongoRepository.deleteTicket(
      ticket_1_Antares_1_project.id,
      ticket_1_Antares_1_project.projectId!
    );

    const projectAndItsTickets = await mongoPrismaClient.project.findFirst({
      where: { id: ticket_1_Antares_1_project.projectId! },
      include: {
        tickets: true,
      },
    });
    // Then
    expect(projectAndItsTickets).toStrictEqual({
      ...antares_1_project,
      tickets: [ticket_2_Antares_1_project],
    });
  });

  test('should delete a project and all its tickets from the database', async () => {
    // Given
    const { mongoRepository } = databaseRepositories;

    const antares_1_project = await mongoPrismaClient.project.create({
      data: {
        name: 'Antares I',
      },
    });
    await mongoPrismaClient.project.create({
      data: {
        name: 'Antares II',
      },
    });
    const ticket_1_Antares_1_project = await mongoPrismaClient.ticket.create({
      data: {
        code: 'ANT-12',
        description: 'Plongée pour inventaire de coraux',
        status: Status.DOING,
        category: Category.ETUDE_FONDS_MARINS,
        projectId: antares_1_project.id,
      },
    });
    const ticket_2_Antares_1_project = await mongoPrismaClient.ticket.create({
      data: {
        code: 'ANT-25',
        description: 'Étude acoustique de chants de cétacés',
        status: Status.TODO,
        category: Category.BIOLOGIE_MARINE,
        projectId: antares_1_project.id,
      },
    });

    // When
    const transactionResult = await mongoRepository.deleteProject(
      antares_1_project.id
    );

    const projectAndItsTickets = await mongoPrismaClient.project.findFirst({
      where: { id: ticket_1_Antares_1_project.projectId! },
      include: {
        tickets: true,
      },
    });

    const tickets = await mongoPrismaClient.project.findMany({
      where: {
        id: {
          in: [ticket_1_Antares_1_project.id, ticket_2_Antares_1_project.id],
        },
      },
    });

    // Then
    expect(transactionResult[0].count).toBe(2);
    expect(transactionResult[1].id).toBe(antares_1_project.id);
    expect(projectAndItsTickets).to.be.null;
    expect(tickets).to.be.empty;
  });
});
