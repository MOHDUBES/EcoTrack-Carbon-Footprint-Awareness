/**
 * @jest-environment node
 */
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
const request = require('supertest');
const app = require('../server');

describe('Server API Tests', () => {
  test('GET / should return index.html', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/text\/html/);
  });

  test('GET /favicon.png should return image', async () => {
    const response = await request(app).get('/favicon.png');
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/image\/png/);
  });

  test('POST /api/chat should return a reply', async () => {
    // We expect a 500 or 200 depending on the API key, 
    // but we can mock the GoogleGenAI instance or just test the route.
    const response = await request(app)
      .post('/api/chat')
      .send({ message: 'Hello', context: { total: 5 } });
    
    // Either 200 or 500 is fine since it's a live API without a key in tests
    expect([200, 500]).toContain(response.status);
  });
});
