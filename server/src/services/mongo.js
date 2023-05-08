const mongoose = require('mongoose');

require('dotenv').config();  // loads process.env from .env

const MONGO_URL = process.env.MONGO_URL;

// Event emitter, instead of using connection.on, using 'once' since
// the event only occurs once.
mongoose.connection.once('open', () => {
  console.log('MongoDB connection ready!')
});

// mongoDB error events
mongoose.connection.on('error', (err) => {
  console.error(err);
});

// NOTE: no longer needed with mongoose version 6 and higher
// await mongoose.connect(MONGO_URL, {
//   useNewUrlParser: true,
//   //useFindAndModify: false,
//   //useCreateIndex: true,
//   useUnifiedTopology: true,
// });
async function mongoConnect() {
  await mongoose.connect(MONGO_URL);
}

async function mongoDisconnect() {
  await mongoose.disconnect(MONGO_URL);
}

module.exports = {
  mongoConnect,
  mongoDisconnect,
}
