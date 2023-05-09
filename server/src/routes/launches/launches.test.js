const request = require('supertest');
const app = require('../../app.js');
const {
  mongoConnect,
  mongoDisconnect,
} = require('../../services/mongo');
const { loadPlanetsData } = require('../../models/planets.model');
const { loadLaunchData } = require('../../models/launches.model');

describe('Launches API', () => {

  beforeAll(async () => {
    await mongoConnect();
    await loadPlanetsData();
    await loadLaunchData();
  });

  afterAll(async () => {
    await mongoDisconnect();
  });

  describe('Test GET /v1/launches', () => {
    test('It should respond with 200 success', async () => {
      // const response = await request(app).get('/launches');
      // expect(response.statusCode).toBe(200);
      const response = await request(app)
        .get('/v1/launches')
        .expect('Content-Type', /json/) // "/json/" regex matches if contains "json"
        .expect(200);
    })
  });

  describe('Test POST /v1/launches', () => {
    const completeLaunchData = {
      mission: 'USS Enterprise',
      rocket: 'NCC 1701-D',
      target: 'Kepler-62 f',
      launchDate: 'January 5, 2028',
    };
    const launchDataNoDate = {
      mission: 'USS Enterprise',
      rocket: 'NCC 1701-D',
      target: 'Kepler-62 f',
    };
    const launchDataInvalidDate = {
      mission: 'USS Enterprise',
      rocket: 'NCC 1701-D',
      target: 'Kepler-62 f',
      launchDate: 'Hello',
    };
    test('It should respond with 201 success', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(completeLaunchData)
        .expect('Content-Type', /json/)
        .expect(201);

      // Check date
      const requestDate =  Date(completeLaunchData.launchDate).valueOf();
      const responseDate = Date(response.body.launchDate).valueOf();
      expect(responseDate).toBe(requestDate);

      expect(response.body).toMatchObject(launchDataNoDate);
    })

    test('It should catch missing properties', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(launchDataNoDate)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: 'Missing required launch property',
      })
    })

    test('It should catch invalid dates', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(launchDataInvalidDate)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: 'Date is invalid',
      })
    })
  });
});
