const express = require("express");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Event = require("./models/event");
const User = require("./models/user");

const app = express();

app.use(bodyParser.json());

// const EVENTS_DATABASE = [];

app.use(
  "/graphql",
  graphqlHTTP({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type User {
          _id: ID
          email: String!
          password: String
        }

        input EventInput {
            title: String!
            description: String!
            price: String!
            date: String!
        }

        input UserInput {
          email: String!
          password: String!
        }
    
        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
      events: () => {
        // return EVENTS_DATABASE;
        return Event.find()
          .then((events) => {
            return events.map((event) => {
              return { ...event._doc, _id: event._doc._id.toString() };
            });
          })
          .catch((err) => {
            console.log("ERROR IN FETCHING EVENTS");
            console.log(err);
            throw err;
          });
      },
      createEvent: (args) => {
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
          creator: "605576cc1a94c6d30ae71eae",
        });
        let createdEvent;
        return event
          .save()
          .then((result) => {
            createdEvent = {
              ...result._doc,
              _id: result._doc._id.toString(),
            };
            return User.findById("605576cc1a94c6d30ae71eae");
            // console.log("NEW EVENT SAVED");
            // console.log(result);
            // return { ...result._doc, _id: result._doc._id.toString() };
          })
          .then((user) => {
            if (!user) {
              throw new Error("User Already Exists");
            }
            user.createdEvents.push(event);
            return user.save();
          })
          .then(() => {
            return createdEvent;
          })
          .catch((err) => {
            console.log("EVENT SAVING ERROR");
            console.log(err);
            throw err;
          });
        // return event;
      },
      createUser: (args) => {
        const { email, password } = args.userInput;
        // Check if user already exists
        return User.findOne({ email })
          .then((user) => {
            if (user) {
              throw new Error("User Already Exists");
            }
            return bcrypt.hash(password, 12);
          })
          .then((hashedPassword) => {
            const user = new User({
              email,
              password: hashedPassword,
            });
            return user.save();
          })
          .then((result) => {
            return { ...result._doc, _id: result.id, password: null };
          })
          .catch((err) => {
            console.log("USER CREEATION FAILED");
            console.log(err);
            throw err;
          });
      },
    },
    graphiql: true,
  })
);
// const conncetionString = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@127.0.0.1:27017`;
const conncetionString = `mongodb://localhost:27017/${process.env.MONGO_DB}`;
console.log(conncetionString);
mongoose
  .connect(conncetionString)
  .then(() => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log("MONGDB COONECTion ERROR");
    console.log(err);
  });
