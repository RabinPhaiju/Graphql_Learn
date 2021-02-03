import { GraphQLServer } from "graphql-yoga";
import { v4 as uuidv4 } from "uuid";

import { users } from "./data/users";
import { posts } from "./data/posts";
import { comments } from "./data/comments";

//Scaler types -> String, Boolean, Int, Float, ID

// Type defination (schema)
const typeDefs = `
  type Query {
    greeting(name: String,position: String): String!
    add(numbers: [Float!]!): Float!
    grades: [Int!]!
    users(query: String): [User!]!
    posts(query: String): [Post!]!
    comments(query: String): [Comment!]!
    me: User!
  }

  type Mutation{
    createUser(name: String!, email: String!,age: Int): User!
    createPost(title: String!, body: String!, published: Boolean!, author: ID!): Post!
    createComment(text: String!, author: ID!, post: ID!): Comment!
  }

  type User{
    id: ID!
    name: String!
    email: String!
    age: Int
    posts: [Post!]!
    comments: [Comment!]!
  }
  type Post{
    id: ID!
    title: String!
    body: String!
    published: Boolean!
    author: User!
    comments: [Comment!]!
  }
  type Comment{
    id: ID!
    text: String!
    author: User!
    post: Post!
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
    comments(parent, args, ctx, info) {
      if (!args.query) {
        return comments;
      } else {
        return comments.filter((comment) => {
          const isTextMatch = comment.text.toLowerCase().includes(args.query.toLowerCase());
          return isTextMatch;
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

  Mutation: {
    createUser(parent, args, ctx, info) {
      const emailTaken = users.some((user) => user.email === args.email);
      if (emailTaken) {
        throw new Error("Email already taken.");
      }

      const user = {
        id: uuidv4(),
        ...args,
      };

      users.push(user);
      return user;
    },
    createPost(parent, args, ctx, info) {
      const userExists = users.some((user) => user.id === args.author);
      if (!userExists) {
        throw new Error("User not found.");
      }

      const post = {
        id: uuidv4(),
        ...args,
      };

      posts.push(post);
      return post;
    },
    createComment(parent, args, ctx, info) {
      const userExists = users.some((user) => user.id === args.author);
      const postExists = posts.some((post) => post.id === args.post && post.published);
      if (!userExists) {
        throw new Error("User not found.");
      } else if (!postExists) {
        throw new Error("Post not found.");
      }

      const comment = {
        id: uuidv4(),
        ...args,
      };

      comments.push(comment);
      return comment;
    },
  },

  Post: {
    author(parent, args, ctx, info) {
      return users.find((user) => {
        return user.id === parent.author;
      });
    },
    comments(parent, args, ctx, info) {
      return comments.filter((comment) => {
        return comment.post === parent.id;
      });
    },
  },
  Comment: {
    author(parent, args, ctx, info) {
      return users.find((user) => {
        return user.id === parent.author;
      });
    },
    post(parent, args, ctx, info) {
      return posts.find((post) => {
        return post.id === parent.post;
      });
    },
  },
  User: {
    posts(parent, args, ctx, info) {
      return posts.filter((post) => {
        return post.author === parent.id;
      });
    },
    comments(parent, args, ctx, info) {
      return comments.filter((comment) => {
        return comment.author === parent.id;
      });
    },
  },
};

const server = new GraphQLServer({
  typeDefs,
  resolvers,
});
server.start(() => console.log("Server is running on localhost : 4000"));
