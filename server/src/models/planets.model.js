const { parse } = require('csv-parse');
const path = require('path');
const fs = require('fs');

const planets = require('./planets.mongo');

const isHabitablePlanet = (planet) => {
  return planet.koi_disposition === 'CONFIRMED'
    && planet.koi_insol > 0.36 && planet.koi_insol < 1.11
    && planet.koi_prad < 1.6;
};

/**
 * The code that reads / parses the kepler_data file is
 * using streams which is ascync code and does not wait
 * for the operation to complete prior to returning, therefore
 * it is possible the operation isn't done before the client
 * reads the data on startup (retrieving an empty array).
 * The code * is surrounded by the loadPlanetsData function
 * and is called from the server before listening on the port.
 * This function returns a promise that will resolve when the
 * operation is done (or reject if an error occurs).
 *
 */
function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'kepler_data.csv'))
    .pipe(parse({       // pipe raw data to parse function
      comment: '#',     // comments prefix
      columns: true,    // return each row as JS obj, key value pairs
    }))
    .on('data', async (data) => {
      if(isHabitablePlanet(data)) {
        await savePlanet(data);
      }
    })
    .on('end', async () => {
      // TODO: The behavior of the query is weird, investigate
      const allPlanets = await getAllPlanets();
      const countOfPlanets = allPlanets.length;
      console.log(`Found ${countOfPlanets} planets`);
      resolve();
    })
    .on('error', (err) => {
      console.log(err.message);
      reject(err);
    });
  });
}

async function getAllPlanets() {
  /**
   * planets.find:
   * 1st arg is a filter, example looks for single doc, 
   * 2nd arg is the projection, list of fields from each document(s)
   * 
   * see documentation for model.
   * 
   * Using empty object filter to return all docs and no projection
   * to indicate all fields.
   */
  return await planets.find({}, // empty filter, return all documents
  // { keplerName: 'Kepler-62 f' }, // filter single document
  // { 'keplerName': 1 }, // projoction, include(1) exclude(0)
  // alternative, string of fields to include, prefix of "-" means exclude
  // 'keplerName, anotherField', // alternative, string of fileds to include

  // Added later in course section, exclude the obect id and schema version
    {
      '_id': 0,
      '__v': 0,
    },
  );
}

async function savePlanet(planet) {
  /**
   * loadPlanetsData() above is called each time the server is
   * started, which would create duplicate DB documents. To avoid
   * duplication, mongoose provide upsert (insert + update), where
   * if data exists, the dicument is update, otherwise create and
   * insert.
   */
  try {
    await planets.updateOne({
      // find doc with keplerName
      keplerName: planet.kepler_name,
    }, {
      // update if doc exists
      keplerName: planet.kepler_name,
    }, {
      // if doc doesn't exist, insert
      upsert: true,
    });
  } catch(err) {
    console.error(`could not save planet ${err}`);
  }
}

module.exports = {
  loadPlanetsData,
  getAllPlanets,
}