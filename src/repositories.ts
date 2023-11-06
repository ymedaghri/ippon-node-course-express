import {
  PrismaClient as MongoPrismaClient,
  Prisma,
  Project,
  Ticket,
} from '../database-mongo/prisma/generated/client-mongo';
import { PrismaClient as PostgresPrismaClient } from '../database-postgres/prisma/generated/client-postgres';

export const mongoPrismaClient = new MongoPrismaClient();
export const postgresPrismaClient = new PostgresPrismaClient();

export type MongoDatabaseRepository = {
  createProject: (projectName: string) => Promise<Project>;
  deleteProject: (id: string) => Promise<
    [
      Prisma.BatchPayload,
      {
        id: string;
        name: string;
      },
    ]
  >;
  createTicket: (ticket: Omit<Ticket, 'id'>) => Promise<Ticket>;
  getAllProjects: () => Promise<Project[]>;
  deleteTicket: (id: string, projectId: string) => Promise<Ticket>;
}

export const mongoDatabaseRepository: MongoDatabaseRepository = {

  createProject: (projectName: string) => {
    return mongoPrismaClient.project.create({
      data: {
        name: projectName,
      },
    });
  },
  deleteProject: async (id: string) => {
    const transaction = await mongoPrismaClient.$transaction([
      mongoPrismaClient.ticket.deleteMany({
        where: {
          projectId: id,
        },
      }),
      mongoPrismaClient.project.delete({
        where: {
          id,
        },
      }),
    ]);

    return transaction;
  },
  createTicket: async (ticket: Omit<Ticket, 'id'>) => {
    return mongoPrismaClient.ticket.create({
      data: ticket,
    });
  },
  getAllProjects: async () => {
    return mongoPrismaClient.project.findMany({
      include: {
        tickets: true
      }
    })
  },
  deleteTicket: async (id: string, projectId: string) => {
    const ticket = await mongoPrismaClient.ticket.delete({
      where: {
        id,
        projectId,
      },
    });
    return ticket;
  },
};

export type repositories = {
  mongoRepository: {
    createProject: (projectName: string) => Promise<Project>;
    deleteProject: (id: string) => Promise<
      [
        Prisma.BatchPayload,
        {
          id: string;
          name: string;
        },
      ]
    >;
    createTicket: (ticket: Omit<Ticket, 'id'>) => Promise<Ticket>;
    getAllProjects: () => Promise<Project[]>;
    deleteTicket: (id: string, projectId: string) => Promise<Ticket>;
  };
  postgresRepository: Record<string, string>;
};
/*
export class MongoDatabaseRepository {

  async createProject(projectName: string) {
    return mongoPrismaClient.project.create({
      data: {
        name: projectName,
      },
    });
  }

  async deleteProject(id: string) {
    const transaction = await mongoPrismaClient.$transaction([
      mongoPrismaClient.ticket.deleteMany({
        where: {
          projectId: id,
        },
      }),
      mongoPrismaClient.project.delete({
        where: {
          id,
        },
      }),
    ]);

    return transaction;
  }

  async createTicket(ticket: Omit<Ticket, 'id'>) {
    return mongoPrismaClient.ticket.create({
      data: ticket,
    });
  }

  async getAllProjects() {
    return mongoPrismaClient.project.findMany({
      include: {
        tickets: true,
      },
    });
  }

  async deleteTicket(id: string, projectId: string) {
    const ticket = await mongoPrismaClient.ticket.delete({
      where: {
        id,
        projectId,
      },
    });
    return ticket;
  }
}
*/
export const databaseRepositories: repositories = {
  mongoRepository: {
    createProject: (projectName: string) => {
      return mongoPrismaClient.project.create({
        data: {
          name: projectName,
        },
      });
    },
    deleteProject: async (id: string) => {
      const transaction = await mongoPrismaClient.$transaction([
        mongoPrismaClient.ticket.deleteMany({
          where: {
            projectId: id,
          },
        }),
        mongoPrismaClient.project.delete({
          where: {
            id,
          },
        }),
      ]);

      return transaction;
    },
    createTicket: async (ticket: Omit<Ticket, 'id'>) => {
      return mongoPrismaClient.ticket.create({
        data: ticket,
      });
    },
    getAllProjects: async () => {
      return mongoPrismaClient.project.findMany({
        include: {
          tickets: true,
        },
      });
    },
    deleteTicket: async (id: string, projectId: string) => {
      const ticket = await mongoPrismaClient.ticket.delete({
        where: {
          id,
          projectId,
        },
      });
      return ticket;
    },
  },
  postgresRepository: {},
};

export default databaseRepositories;
