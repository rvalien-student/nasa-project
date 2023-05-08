require('dotenv').config();  // loads process.env from .env

const http = require('http');
const app = require('./app');
const { mongoConnect } = require('./services/mongo');
const { loadPlanetsData } = require('./models/planets.model');
const { loadLaunchData } = require('./models/launches.model');


const PORT = process.env.PORT || 8000;

/**
 * Express is just a fancy listener function being passed into
 * the createServer call. Any middleware and route handlers
 * attached to the app object will repond to requests coming
 * into the server. Video mentioned doing the server setup
 * a more flexible way than using express app.listen, this
 * allows better organizing by separating the the server from
 * the express code. Using the http server not only allows
 * handling just http requests, but also to other types of
 * connection (mentioned example: using web sockets for real
 * time communication vs request and waiting for response).
 * In this use case, express is just a middleware used with
 * the http server.
 */
const server = http.createServer(app);

async function startServer() {
  await mongoConnect();
  await loadPlanetsData();
  await loadLaunchData();

  server.listen(PORT, () => {
    // PORT passed in as environment variable the package.json 
    console.log(`Listening on port ${PORT}`);
  });
}

startServer();