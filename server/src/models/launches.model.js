const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');
const axios = require('axios');

const DEFAULT_FLIGHT_NUMBER = 100;

// const testLaunch = {
//   flightNumber: 100, // spacex flight_number
//   mission: 'Kepler Exploration X', // spacex name
//   rocket: 'Explorer IS1', // spacex rocket.name
//   launchDate: new Date('December 27, 2030'), // spacex date_local
//   target: 'Kepler-442 b', // spacex not applicable
//   customers: ['ZTM', 'NASA'], // spacex payload.customers for each payload
//   upcoming: true, // spacex upcoming
//   success: true, // spacex success
// }

// saveLaunch(testLaunch);

async function populateSpaceXLaunches() {
  console.log('Loading launches data ....');
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      // page: 2,
      // limit: 20,
      populate: [
        {
          path: 'rocket',
          select: {
            name: 1
          }
        },
        {
          path: 'payloads',
          select: {
            customers: 1
          }
        }
      ]
    }
  });

  if(response.status != 200) {
    console.log('Problem downloading Spacex launch data!');
    throw new Error('SpaceX launch data download failed!')
  }
  const launchDocs = response.data.docs;
  //console.dir(response);
  //console.dir(launchDocs);
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc['payloads'];
    //console.log(payloads);
    const customers = payloads.flatMap((payload) => {
      return payload['customers'];
    });
    const launch = {
      flightNumber: launchDoc['flight_number'],
      mission: launchDoc['name'],
      rocket: launchDoc['rocket']['name'],
      launchDate: launchDoc['date_local'],
      upcoming: launchDoc['upcoming'],
      success: launchDoc['success'],
      customers,
    }
    //console.log(`${launch.flightNumber} ${launch.mission}`);

    await saveLaunch(launch);
  }
}

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

// Reading paginated data ("pag" pronounced like "beauty pageant", =>
// pag-in-ated)

async function loadLaunchData() {
  // Check for first SpaceX Launch present in DB
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: 'Falcon 1',
    mission: 'FalconSat',
  });
  // SpaceX launches not present, load to DB
  if(!firstLaunch) {
    await populateSpaceXLaunches();
  }
}

async function findLaunch(filter) {
  return await launchesDatabase.findOne(filter);
}

async function existsLaunchWithId(launchId) {
  return await findLaunch({ flightNumber: launchId });
}

async function getLatestFlightNumber() {
  // The minus sign indecates sort descending
  const latestLaunch = await launchesDatabase
    .findOne()
    .sort('-flightNumber');
  
  return (latestLaunch) ? latestLaunch.flightNumber : DEFAULT_FLIGHT_NUMBER;
}

async function getAllLaunches(skip, limit) {
  //return Array.from(launches.values());
  return await launchesDatabase
  .find({}, { _id: 0, __v: 0, })
  .sort({ flightNumber: 1})
  .skip(skip)       // use skip to implement pagination
  .limit(limit);
}

async function saveLaunch(launch) {
  
  
  await launchesDatabase.findOneAndUpdate({
    flightNumber: launch.flightNumber
  }, launch, {
    upsert: true,
  });
}

async function scheduleNewLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target,
  });
  if(!planet) {
    throw new Error('No matching planet found!');
  }
  const newFlightNumber = (await getLatestFlightNumber()) + 1;
  const newLaunch  = Object.assign(launch, {
      success: true,
      upcoming: true,
      customers: [ 'ZTM', 'NASA'],
      flightNumber: newFlightNumber,
    });
    await saveLaunch(newLaunch);
}

async function abortLaunchById(launchId) {
  const aborted = await launchesDatabase.updateOne({
    flightNumber: launchId, }, {
      upcoming: false,
      success: false,
    });
    console.log(aborted);
  return aborted.modifiedCount === 1;
}

module.exports = {
  loadLaunchData,
  findLaunch,
  existsLaunchWithId,
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunchById,
}