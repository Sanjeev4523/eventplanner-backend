const bcrypt = require("bcryptjs");

const Event = require("../../models/event");
const User = require("../../models/user");
const Booking = require("../../models/booking");

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

const fetchSingleEvent = async (eventId) => {
  try {
    const event = await Event.findById(eventId);
    return {
      ...event._doc,
      _id: event.id,
      creator: user.bind(this, event.creator),
    };
  } catch (err) {
    console.log("ERROR IN FETCHING SINGLE EVENT");
    console.log(error);
    throw error;
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
  bookings: async (args) => {
    try {
      const bookings = await Booking.find();
      return bookings.map((booking) => {
        return {
          ...booking._doc,
          _id: booking.id,
          user: user.bind(this, booking._doc.user),
          event: fetchSingleEvent.bind(this, booking._doc.event),
          createdAt: new Date(booking._doc.createdAt).toISOString(),
          updatedAt: new Date(booking._doc.updatedAt).toISOString(),
        };
      });
    } catch {
      console.log("ERROR IN FETCHING BOOKINGS");
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
  bookEvent: async (args) => {
    const { eventId } = args;
    const fetchedEvent = await Event.findOne({ _id: eventId });
    const booking = new Booking({
      user: "6055843c5e0b0bf016bceb0b",
      event: fetchedEvent,
    });
    const result = await booking.save();
    return {
      ...result._doc,
      _id: result.id,
      user: user.bind(this, result._doc.user),
      event: fetchSingleEvent.bind(this, result._doc.event),
      createdAt: new Date(result._doc.createdAt).toISOString(),
      updatedAt: new Date(result._doc.updatedAt).toISOString(),
    };
  },
  cancelBooking: async (args) => {
    const { bookingId } = args;
    try {
      const booking = await Booking.findById(bookingId).populate("event");
      const event = {
        ...booking.event._doc,
        _id: booking.event.id,
        creator: user.bind(this, booking.event._doc.creator),
      };
      await Booking.deleteOne({ _id: bookingId });
      return event;
    } catch (err) {
      console.log("ERROR IN DELETING BOOKING");
      console.log(err);
      throw err;
    }
  },
};
