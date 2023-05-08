const mongoose = require('mongoose');

const planetSchema = new mongoose.Schema({
  keplerName: {
    type: String,
    required: true,
  },
});

/**
 * Connects planetSchema with the "planets" collection.
 * 
 * The 1st arg is name of collection in DB, should be singular,
 * mongoose takes the argument and converts to lower case and makes
 * the collection name plural.
 */
module.exports = mongoose.model('Planet', planetSchema);