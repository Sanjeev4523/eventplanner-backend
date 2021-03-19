const express = require("express");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");

const app = express();

app.use(bodyParser.json());

const EVENTS_DATABASE = ["Cooking", "Coding", "GraphQL Conf", "MongoDB"];
app.use(
  "/graphql",
  graphqlHTTP({
    schema: buildSchema(`
        type RootQuery {
            events: [String!]!
        }

        type RootMutation {
            createEvent(name: String): String
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
        const eventName = args.name;
        EVENTS_DATABASE.push(eventName);
        return `${eventName} was successfully created`;
      },
    },
    graphiql: true,
  })
);

app.listen(3000);
