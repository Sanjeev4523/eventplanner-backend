const Event = require("../../models/event");
const User = require("../../models/user");
const { transformEvent } = require("./merge");

module.exports = {
  events: async () => {
    // return EVENTS_DATABASE;
    try {
      const events = await Event.find();
      // .populate("creator")
      return events.map((event) => {
        return transformEvent(event);
      });
    } catch (err) {
      console.log("ERROR IN FETCHING EVENTS");
      console.log(err);
      throw err;
    }
  },
  createEvent: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("UnAuthenticated");
    }
    const { title, description, price, date } = args.eventInput;
    const event = new Event({
      title,
      description,
      price: +price,
      date: new Date(date),
      creator: req.userId,
    });
    let createdEvent;
    try {
      const result = await event.save();
      createdEvent = transformEvent(result);
      const creator = await User.findById("6055843c5e0b0bf016bceb0b");
      if (!creator) {
        throw new Error("User does not exists");
      }
      creator.createdEvents.push(event);
      await creator.save();
      return createdEvent;
    } catch (err) {
      console.log("EVENT SAVING ERROR");
      console.log(err);
      throw err;
    }
  },
};
