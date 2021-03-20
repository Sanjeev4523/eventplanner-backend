const bcrypt = require("bcryptjs");

const Event = require("../../models/event");
const User = require("../../models/user");

const events = async (eventIds) => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    return events.map((event) => {
      return {
        ...event._doc,
        _id: event.id,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, event.creator),
      };
    });
  } catch (err) {
    console.log("Error in Fteching Events");
    console.log(err);
    throw err;
  }
};

const user = async (userId) => {
  try {
    const user = await User.findById(userId);
    return {
      ...user._doc,
      _id: user.id,
      createdEvents: events.bind(this, user._doc.createdEvents),
    };
  } catch (err) {
    console.log("ERROR IN FETCHING USER");
    console.log(err);
    throw err;
  }
};

module.exports = {
  events: async () => {
    // return EVENTS_DATABASE;
    try {
      const events = await Event.find();
      // .populate("creator")
      return events.map((event) => {
        return {
          ...event._doc,
          _id: event._doc._id.toString(),
          date: new Date(event._doc.date).toISOString(),
          // creator: {
          //   ...event._doc.creator._doc,
          //   _id: event._doc.creator.id,
          // },
          creator: user.bind(this, event._doc.creator),
        };
      });
    } catch (err) {
      console.log("ERROR IN FETCHING EVENTS");
      console.log(err);
      throw err;
    }
  },
  createEvent: async (args) => {
    const { title, description, price, date } = args.eventInput;
    // const event = {
    //   _id: Math.random().toString(),
    //   title,
    //   description,
    //   price: +price,
    //   date: date,
    // };
    // EVENTS_DATABASE.push(event);
    const event = new Event({
      title,
      description,
      price: +price,
      date: new Date(date),
      creator: "6055843c5e0b0bf016bceb0b",
    });
    let createdEvent;
    try {
      const result = await event.save();
      createdEvent = {
        ...result._doc,
        _id: result._doc._id.toString(),
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, result.creator),
      };
      const creator = await User.findById("6055843c5e0b0bf016bceb0b");
      // console.log("NEW EVENT SAVED");
      // console.log(result);
      // return { ...result._doc, _id: result._doc._id.toString() };
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
    // return event;
  },
  createUser: async (args) => {
    const { email, password } = args.userInput;
    // Check if user already exists
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error("User Already Exists");
      }
      const hashedPassword = await bcrypt.hash(password, 12);

      const newUser = new User({
        email,
        password: hashedPassword,
      });
      const result = await newUser.save();

      return { ...result._doc, _id: result.id, password: null };
    } catch (err) {
      console.log("USER CREEATION FAILED");
      console.log(err);
      throw err;
    }
  },
};
