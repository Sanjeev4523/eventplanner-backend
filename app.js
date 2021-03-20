const express = require("express");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");

const mongoose = require("mongoose");

const graphQlSchema = require("./graphql/schema/index");
const graphQlResolvers = require("./graphql/resolvers/index");
const isAuth = require("./middleware/is-auth");

const app = express();

app.use(bodyParser.json());

app.use(isAuth);

app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
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
