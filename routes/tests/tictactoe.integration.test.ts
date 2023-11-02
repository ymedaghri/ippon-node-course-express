import { expect, describe, test } from 'vitest'
import request from 'supertest';
import app from '../../app'

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
