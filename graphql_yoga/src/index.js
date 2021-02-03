import { GraphQLServer } from "graphql-yoga";

//Scaler types -> String, Boolean, Int, Float, ID

// Type defination (schema)
const typeDefs = `
  type Query {
    greeting(name: String,position: String): String!
    add(x: Float!, y: Float!): Float!
    me: User!
    posts: Post!
  }
  type User{
    id: ID!
    name: String!
    email: String!
    age: Int
  }
  type Post{
    id: ID!
    title: String!
    body: String!
    published: Boolean!
  }
`;

// Resolvers
const resolvers = {
  Query: {
    greeting: (parent, args, ctx, info) => `hello ${args.name || "world"} ${args.position}`,
    add: (parent, args, ctx, info) => args.x + args.y,
    me() {
      return {
        id: "12323",
        name: "Rabin",
        email: "rabin@gmial.com",
        age: null,
      };
    },
    posts() {
      return {
        id: "123",
        title: "new phone",
        body: "smartphone",
        published: false,
      };
    },
  },
};

const server = new GraphQLServer({ typeDefs, resolvers });
server.start(() => console.log("Server is running on localhost : 4000"));
