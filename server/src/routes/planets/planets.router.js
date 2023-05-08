const express = require('express');

const { httpGetAllPlanets, } = require('./planets.controller');

const planetsRouter = express.Router();

// Routes mounted at /planets in app.js
planetsRouter.get('/', httpGetAllPlanets);

module.exports = planetsRouter;