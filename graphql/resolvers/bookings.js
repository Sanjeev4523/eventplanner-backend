const Booking = require("../../models/booking");
const Event = require("../../models/event");
const { transformEvent, transformBooking } = require("./merge");

module.exports = {
  bookings: async () => {
    try {
      const bookings = await Booking.find();
      return bookings.map((booking) => {
        return transformBooking(booking);
      });
    } catch {
      console.log("ERROR IN FETCHING BOOKINGS");
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
    return transformBooking(result);
  },
  cancelBooking: async (args) => {
    const { bookingId } = args;
    try {
      const booking = await Booking.findById(bookingId).populate("event");
      const event = transformEvent(booking.event);
      await Booking.deleteOne({ _id: bookingId });
      return event;
    } catch (err) {
      console.log("ERROR IN DELETING BOOKING");
      console.log(err);
      throw err;
    }
  },
};
