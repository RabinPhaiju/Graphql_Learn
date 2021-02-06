import { GraphQLServer, PubSub } from "graphql-yoga";
import { resolvers } from "./resolvers/index.js";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

const pubsub = new PubSub();

const server = new GraphQLServer({
  typeDefs: "./src/schema.graphql",
  resolvers,
  context(request) {
    return {
      pubsub,
      prisma,
      request,
    };
  },
});
server.start(() => console.log("Server is running on localhost : 4000"));
