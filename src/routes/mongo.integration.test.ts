import { expect, describe, test, beforeAll, vi } from 'vitest'
import request from 'supertest';
import appProvider from '../app'
import { repositories } from '../repositories';
import { Express } from 'express'

let repositoriesMock: repositories, app: Express

describe(`Tests d'API`, () => {
    beforeAll(async () => {
        repositoriesMock = {
            mongoRepository: {
                createUser: vi.fn(() => Promise.resolve({ id: 'roro', email: 'riri', name: 'ruru' }))
            },
            postgresRepository: {}
        }
        app = await appProvider(repositoriesMock)
    })
    test('should return 201 OK for /new-user', async () => {
        // When
        const response = await request(app).post('/new-user');
        // Then
        expect(response.status).toBe(201);
        expect(response.type).toBe('application/json');
        expect(response.body).toStrictEqual({
            "email": "riri",
            "id": "roro",
            "name": "ruru",
        });
    });
});
