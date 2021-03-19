const express = require("express");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");

const app = express();

app.use(bodyParser.json());

const EVENTS_DATABASE = [];

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
        return EVENTS_DATABASE;
      },
      createEvent: (args) => {
        const { title, description, price, date } = args.eventInput;
        const event = {
          _id: Math.random().toString(),
          title,
          description,
          price: +price,
          date: date,
        };
        EVENTS_DATABASE.push(event);
        return event;
      },
    },
    graphiql: true,
  })
);

app.listen(3000);
