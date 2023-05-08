const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan'); // logging middleware
const api = require('./routes/api');
const app = express();

// Optional code to support dynamic origins (see NPM site: cors)
app.use(cors({
  origin: 'http://localhost:3000',
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/v1', api);

// Client (react) root connection
app.use('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

module.exports = app;