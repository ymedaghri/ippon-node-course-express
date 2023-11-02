import { expect, describe, test, vi, beforeAll } from 'vitest'
import request from 'supertest';
import appProvider from '../app'
import { repositories } from '../repositories';
import { Express } from 'express'

let repositoriesMock: repositories, app: Express

describe(`Tests d'API`, () => {
    beforeAll(async () => {
        repositoriesMock = {
            mongoRepository: {
                createUser: vi.fn()
            },
            postgresRepository: {}
        }
        app = appProvider(repositoriesMock)
    })
    test('should return 201 OK for /new-game', async () => {
        // When
        const response = await request(app).post('/new-game');
        // Then
        expect(response.status).toBe(201);
        expect(response.type).toBe('application/json');
        expect(response.body).toHaveProperty('board', [0, 0, 0, 0, 0, 0, 0, 0, 0]);
    });
});
