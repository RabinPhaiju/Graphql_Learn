import { GraphQLServer } from "graphql-yoga";
import { users } from "./data/users";
import { posts } from "./data/posts";

//Scaler types -> String, Boolean, Int, Float, ID

// Type defination (schema)
const typeDefs = `
  type Query {
    greeting(name: String,position: String): String!
    add(numbers: [Float!]!): Float!
    grades: [Int!]!
    users(query: String): [User!]!
    posts(query: String): [Post!]!
    me: User!
  }
  type User{
    id: ID!
    name: String!
    email: String!
    age: Int
    posts: [Post!]!
  }
  type Post{
    id: ID!
    title: String!
    body: String!
    published: Boolean!
    author: User!
  }
`;

// Resolvers
const resolvers = {
  Query: {
    greeting: (parent, args, ctx, info) => `hello ${args.name || "world"} ${args.position}`,
    add(parent, args, ctx, info) {
      if (args.numbers.length === 0) {
        return 0;
      } else {
        return args.numbers.reduce((accumulator, currentValue) => {
          return accumulator + currentValue;
        });
      }
    },
    grades: (parent, args, ctx, info) => [33, 44, 55],
    users(parent, args, ctx, info) {
      if (!args.query) {
        return users;
      } else {
        return users.filter((user) => {
          return user.name.toLowerCase().includes(args.query.toLowerCase());
        });
      }
    },
    posts(parent, args, ctx, info) {
      if (!args.query) {
        return posts.filter((post) => {
          return post.published;
        });
      } else {
        return posts.filter((post) => {
          const isTitleMatch = post.title.toLowerCase().includes(args.query.toLowerCase());
          const isBodyMatch = post.body.toLowerCase().includes(args.query.toLowerCase());
          return (isTitleMatch || isBodyMatch) && post.published;
        });
      }
    },
    me() {
      return {
        id: "12323",
        name: "Rabin",
        email: "rabin@gmial.com",
        age: null,
      };
    },
  },
  Post: {
    author(parent, args, ctx, info) {
      return users.find((user) => {
        return user.id === parent.author;
      });
    },
  },
  User: {
    posts(parent, args, ctx, info) {
      return posts.filter((post) => {
        return post.author === parent.id;
      });
    },
  },
};

const server = new GraphQLServer({
  typeDefs,
  resolvers,
});
server.start(() => console.log("Server is running on localhost : 4000"));
