import { GraphQLServer } from "graphql-yoga";

// Type defination (schema)
const typeDefs = `
  type Query {
    hello(name: String): String!
    name(name: String): String!
    location(name: String): String!
    bio(name: String): String!
  }
`;

// Resolvers
const resolvers = {
  Query: {
    hello: () => "Hello World",
    name: () => "Rabin Phaiju",
    location: () => "Bhaktapur",
    bio: () => "Software Engineer",
  },
};

const server = new GraphQLServer({ typeDefs, resolvers });
server.start(() => console.log("Server is running on localhost : 4000"));
