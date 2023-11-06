import { expect, describe, test, vi, beforeAll } from 'vitest';
import request from 'supertest';
import appProvider from '../app';
import { repositories } from '../repositories';
import { Express } from 'express';
import {
  Category,
  Status,
} from '../../database-mongo/prisma/generated/client-mongo';
import { iocContainer } from '../tsoa/ioc';
import { KanbanEndpoints } from './kanbanEndpoints';

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
    iocContainer.set(KanbanEndpoints, new KanbanEndpoints(repositoriesMock.mongoRepository))
    app = appProvider(repositoriesMock);
  });
  describe(`POST /kanban-projects`, () => {
    test('should return 422 Bad Request for POST when name is not send in the body', async () => {
      // When
      const response = await request(app).post('/kanban-projects');

      // Then
      expect(response.status).toBe(422);
      expect(response.type).toBe('application/json');
      expect(response.body).toStrictEqual({
        "details": {
          "requestBody.name": {
            "message": "'name' is required",
          },
        },
        "message": "Validation Failed",
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
    test('should return 422 Bad Request for POST when nothing is sent in the body', async () => {
      // When
      const response = await request(app).post(
        '/kanban-projects/65451c26ac6932248cad1543/tickets'
      );

      // Then
      expect(response.status).toBe(422);
      expect(response.type).toBe('application/json');
      expect(response.body).toStrictEqual({
        "details": {
          "requestBody.category": {
            "message": "'category' is required",
          },
          "requestBody.code": {
            "message": "'code' is required",
          },
          "requestBody.description": {
            "message": "'description' is required",
          },
          "requestBody.status": {
            "message": "'status' is required",
          },
        },
        "message": "Validation Failed",
      });
    });
    test('should return 422 Bad Request for POST when status is not one of the Status enum values in the body', async () => {
      // When
      const response = await request(app)
        .post('/kanban-projects/65451c26ac6932248cad1543/tickets')
        .send({
          code: 'ANT-42',
          description: 'Étude acoustique de chants de cétacés',
          status: 'NotAGoodStatus',
          category: Category.BIOLOGIE_MARINE
        });

      // Then
      expect(response.status).toBe(422);
      expect(response.type).toBe('application/json');
      expect(response.body).toStrictEqual({
        "details": {
          "requestBody.status": {
            "message": "Could not match the union against any of the items. Issues: [{\"requestBody.status\":{\"message\":\"should be one of the following; ['TODO']\",\"value\":\"NotAGoodStatus\"}},{\"requestBody.status\":{\"message\":\"should be one of the following; ['DOING']\",\"value\":\"NotAGoodStatus\"}},{\"requestBody.status\":{\"message\":\"should be one of the following; ['DONE']\",\"value\":\"NotAGoodStatus\"}}]",
            "value": "NotAGoodStatus",
          },
        },
        "message": "Validation Failed",
      });
    });
    test('should return 422 Bad Request for POST when category is not send in the body', async () => {
      // When
      const response = await request(app)
        .post('/kanban-projects/65451c26ac6932248cad1543/tickets')
        .send({
          code: 'ANT-42',
          description: 'Étude acoustique de chants de cétacés',
          status: Status.DONE,
          category: "NotAGoodCategory"
        });

      // Then      
      expect(response.status).toBe(422);
      expect(response.type).toBe('application/json');
      expect(response.body).toStrictEqual({
        "details": {
          "requestBody.category": {
            "message": "Could not match the union against any of the items. Issues: [{\"requestBody.category\":{\"message\":\"should be one of the following; ['ETUDE_FONDS_MARINS']\",\"value\":\"NotAGoodCategory\"}},{\"requestBody.category\":{\"message\":\"should be one of the following; ['BIOLOGIE_MARINE']\",\"value\":\"NotAGoodCategory\"}},{\"requestBody.category\":{\"message\":\"should be one of the following; ['CONSERVATION_MARINE']\",\"value\":\"NotAGoodCategory\"}}]",
            "value": "NotAGoodCategory",
          },
        },
        "message": "Validation Failed",
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
