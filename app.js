const express = require("express");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");

const Event = require("./models/event");

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

        input EventInput {
            title: String!
            description: String!
            price: String!
            date: String!
        }
    
        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
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
        });
        return event
          .save()
          .then((result) => {
            console.log("NEW EVENT SAVED");
            console.log(result);
            return { ...result._doc, _id: result._doc._id.toString() };
          })
          .catch((err) => {
            console.log("EVENT SAVING ERROR");
            console.log(err);
            throw err;
          });
        // return event;
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
