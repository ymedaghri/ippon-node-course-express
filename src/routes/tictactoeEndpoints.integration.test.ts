import { expect, describe, test, vi } from 'vitest';
import request from 'supertest';
import appProvider from '../app';
import { databaseRepositories, repositories } from '../repositories';

const repositoriesMock: repositories = vi.mocked(databaseRepositories);
const app = appProvider();

describe(`Tests d'API`, () => {
  test('should return 201 OK for /new-game', async () => {
    // When
    const response = await request(app).post('/new-game');
    // Then
    expect(response.status).toBe(201);
    expect(response.type).toBe('application/json');
    expect(response.body).toHaveProperty('board', [0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });
});
