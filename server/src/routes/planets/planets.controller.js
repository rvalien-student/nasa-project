const { getAllPlanets } = require('../../models/planets.model')

async function httpGetAllPlanets(req, res) {
  /**
   * The return statement used to ensure guarrantee the function stops
   * excuting at that point and no following attempt will be made to
   * set the rsp, this would result in an error "headers already set".
   * Express ignores the return value. 
   */
  return res.status(200).json(await getAllPlanets());
}

module.exports = {
  httpGetAllPlanets,
};
