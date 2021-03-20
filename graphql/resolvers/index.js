const authResolver = require("./auth");
const eventsResolver = require("./events");
const bookingsResolver = require("./bookings");

/**
 * ! MAke Sure no two resolver have a function with same name!
*/

const rootResolver = {
    ...authResolver,
    ...eventsResolver,
    ...bookingsResolver,
}

module.exports = rootResolver