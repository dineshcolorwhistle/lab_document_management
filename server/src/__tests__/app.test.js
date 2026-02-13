/* eslint-disable no-undef */
const request = require('supertest');
const { app } = require('../app');

describe('App Integration', () => {
    it('should respond with 200 on GET /', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('name', 'lab-document-management-api');
    });

    it('should handle 404 for unknown routes', async () => {
        const response = await request(app).get('/unknown-route');
        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'Route not found: GET /unknown-route');
    });
});
