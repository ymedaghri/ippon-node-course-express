import { expect, describe, test, vi, beforeAll } from 'vitest';
import request from 'supertest';
import appProvider from '../app';
import { repositories } from '../repositories';
import { Express } from 'express';
import {
  Category,
  Status,
} from '../../database-mongo/prisma/generated/client-mongo';

let repositoriesMock: repositories, app: Express;

describe(`Tests d'API`, () => {
  beforeAll(async () => {
    repositoriesMock = {
      mongoRepository: {
        createProject: vi.fn((name: string) =>
          Promise.resolve({ id: '65451c26ac6932248cad1543', name })
        ),
        createTicket: vi.fn(
          (ticket: {
            code: string;
            description: string;
            status: Status;
            category: Category;
            projectId: string | null;
          }) =>
            Promise.resolve({
              id: '26ac695462ad13248c5451c3',
              code: ticket.code,
              description: ticket.description,
              status: ticket.status,
              category: ticket.category,
              projectId: ticket.projectId,
            })
        ),
        getAllProjects: vi.fn(() =>
          Promise.resolve([
            {
              id: '65451c26ac6932248cad1543',
              name: 'Antares XVIII',
              tickets: [
                {
                  id: '26ac695462ad13248c5451c3',
                  code: 'ANT-42',
                  description: 'Étude acoustique de chants de cétacés',
                  status: Status.DOING,
                  category: Category.BIOLOGIE_MARINE,
                  projectId: '65451c26ac6932248cad1543',
                },
              ],
            },
          ])
        ),
        deleteTicket: vi.fn((id: string, projectId: string) =>
          Promise.resolve({
            id,
            code: 'ANT-42',
            description: 'Plongée pour inventaire de coraux',
            status: Status.DONE,
            category: Category.ETUDE_FONDS_MARINS,
            projectId,
          })
        ),
        deleteProject: vi.fn((id: string) =>
          Promise.resolve([{ count: 2 }, { id, name: 'Antares XVIII' }])
        ),
      },
      postgresRepository: {},
    };
    app = appProvider(repositoriesMock);
  });
  describe(`POST /kanban-projects`, () => {
    test('should return 400 Bad Request for POST when name is not send in the body', async () => {
      // When
      const response = await request(app).post('/kanban-projects');

      // Then
      expect(response.status).toBe(400);
      expect(response.type).toBe('application/json');
      expect(response.body).toStrictEqual({
        error:
          'A "name" property of type string is required in the request body.',
      });
    });
    test('should return 201 when sending all expected data in POST', async () => {
      // When
      const response = await request(app)
        .post('/kanban-projects')
        .send({ name: 'Antares VI' });

      // Then
      expect(response.status).toBe(201);
      expect(response.type).toBe('application/json');
      expect(response.body).toHaveProperty('id', '65451c26ac6932248cad1543');
      expect(response.body).toHaveProperty('name', 'Antares VI');
    });
  });

  describe(`DELETE /kanban-projects/65451c26ac6932248cad1543`, () => {
    test('should return 200 and a Prisma BatchPayload', async () => {
      // Given
      const projectId = '65451c26ac6932248cad1543';

      // When
      const response = await request(app).delete(
        `/kanban-projects/${projectId}`
      );

      // Then
      expect(response.status).toBe(200);
      expect(response.type).toBe('application/json');
      expect(response.body).toStrictEqual([
        {
          count: 2,
        },
        {
          id: projectId,
          name: 'Antares XVIII',
        },
      ]);
    });
  });
  describe(`GET /kanban-projects`, () => {
    test('should return 200 and all kanban projects for GET', async () => {
      // When
      const response = await request(app).get('/kanban-projects');

      // Then
      expect(response.status).toBe(200);
      expect(response.type).toBe('application/json');
      expect(response.body).toStrictEqual([
        {
          id: '65451c26ac6932248cad1543',
          name: 'Antares XVIII',
          tickets: [
            {
              id: '26ac695462ad13248c5451c3',
              code: 'ANT-42',
              description: 'Étude acoustique de chants de cétacés',
              status: Status.DOING,
              category: Category.BIOLOGIE_MARINE,
              projectId: '65451c26ac6932248cad1543',
            },
          ],
        },
      ]);
    });
  });

  describe(`POST /kanban-projects/65451c26ac6932248cad1543/tickets`, () => {
    test('should return 400 Bad Request for POST when code is not send in the body', async () => {
      // When
      const response = await request(app).post(
        '/kanban-projects/65451c26ac6932248cad1543/tickets'
      );

      // Then
      expect(response.status).toBe(400);
      expect(response.type).toBe('application/json');
      expect(response.body).toStrictEqual({
        error:
          'A "code" property of type string is required in the request body.',
      });
    });
    test('should return 400 Bad Request for POST when description is not send in the body', async () => {
      // When
      const response = await request(app)
        .post('/kanban-projects/65451c26ac6932248cad1543/tickets')
        .send({ code: 'ANT-42' });

      // Then
      expect(response.status).toBe(400);
      expect(response.type).toBe('application/json');
      expect(response.body).toStrictEqual({
        error:
          'A "description" property of type string is required in the request body.',
      });
    });
    test('should return 400 Bad Request for POST when status is not send in the body', async () => {
      // When
      const response = await request(app)
        .post('/kanban-projects/65451c26ac6932248cad1543/tickets')
        .send({
          code: 'ANT-42',
          description: 'Étude acoustique de chants de cétacés',
        });

      // Then
      expect(response.status).toBe(400);
      expect(response.type).toBe('application/json');
      expect(response.body).toStrictEqual({
        error:
          'A "status" property of type enum [TODO,DOING,DONE] is required in the request body.',
      });
    });
    test('should return 400 Bad Request for POST when status is not one of the Status enum values in the body', async () => {
      // When
      const response = await request(app)
        .post('/kanban-projects/65451c26ac6932248cad1543/tickets')
        .send({
          code: 'ANT-42',
          description: 'Étude acoustique de chants de cétacés',
          status: 'RR',
        });

      // Then
      expect(response.status).toBe(400);
      expect(response.type).toBe('application/json');
      expect(response.body).toStrictEqual({
        error:
          'A "status" property of type enum [TODO,DOING,DONE] is required in the request body.',
      });
    });
    test('should return 400 Bad Request for POST when category is not send in the body', async () => {
      // When
      const response = await request(app)
        .post('/kanban-projects/65451c26ac6932248cad1543/tickets')
        .send({
          code: 'ANT-42',
          description: 'Étude acoustique de chants de cétacés',
          status: Status.DONE,
        });

      // Then
      expect(response.status).toBe(400);
      expect(response.type).toBe('application/json');
      expect(response.body).toStrictEqual({
        error:
          'A "category" property of type enum [ETUDE_FONDS_MARINS,BIOLOGIE_MARINE,CONSERVATION_MARINE] is required in the request body.',
      });
    });
    test('should return 201 when sending all expected data in POST', async () => {
      // When
      const response = await request(app)
        .post('/kanban-projects/65451c26ac6932248cad1543/tickets')
        .send({
          code: 'ANT-42',
          description: 'Étude acoustique de chants de cétacés',
          status: Status.DONE,
          category: Category.BIOLOGIE_MARINE,
        });

      // Then
      expect(response.status).toBe(201);
      expect(response.type).toBe('application/json');
      expect(response.body).toHaveProperty('id', '26ac695462ad13248c5451c3');
      expect(response.body).toHaveProperty('code', 'ANT-42');
      expect(response.body).toHaveProperty(
        'description',
        'Étude acoustique de chants de cétacés'
      );
      expect(response.body).toHaveProperty('status', Status.DONE);
      expect(response.body).toHaveProperty(
        'category',
        Category.BIOLOGIE_MARINE
      );
    });
  });

  describe(`DELETE /kanban-projects/65451c26ac6932248cad1543/tickets/26ac695462ad13248c5451c3`, () => {
    test('should return 200 and an empty response for DELETE', async () => {
      // Given
      const projectId = '26ac695462ad13248c5451c3';
      const ticketId = '65451c26ac6932248cad1543';

      // When
      const response = await request(app).delete(
        `/kanban-projects/${projectId}/tickets/${ticketId}`
      );

      // Then
      expect(response.status).toBe(200);
      expect(response.type).toBe('application/json');
      expect(response.body).toStrictEqual({
        id: ticketId,
        code: 'ANT-42',
        description: 'Plongée pour inventaire de coraux',
        status: Status.DONE,
        category: Category.ETUDE_FONDS_MARINS,
        projectId,
      });
    });
  });
});
