import { GraphQLServer } from "graphql-yoga";
import { v4 as uuidv4 } from "uuid";

var users = [
  {
    id: "1",
    name: "Rabin",
    email: "rabin@gmail.com",
    age: 27,
  },
  {
    id: "2",
    name: "sarah",
    email: "sarah@example.com",
    age: null,
  },
];

var posts = [
  {
    id: "1",
    title: "post 1",
    body: "This is a new ",
    published: true,
    author: "1",
  },
  {
    id: "2",
    title: "post 2",
    body: "This is a new post",
    published: true,
    author: "2",
  },
  {
    id: "3",
    title: "post 3",
    body: "This is a new ",
    published: true,
    author: "1",
  },
];

var comments = [
  {
    id: "1",
    text: "first comment",
    author: "1",
    post: "1",
  },
  {
    id: "2",
    text: "second comment",
    author: "2",
    post: "2",
  },
  {
    id: "3",
    text: "third comment",
    author: "1",
    post: "2",
  },
  {
    id: "4",
    text: "fourth comment",
    author: "2",
    post: "1",
  },
];

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
    createUser(data: CreateUserInput!): User!
    deleteUser(id: ID!): User!
    createPost(data: CreatePostInput!): Post!
    deletePost(id: ID!): Post!
    createComment(data: CreateCommentInput!): Comment!
    deleteComment(id: ID!): Comment!
  }

  input CreateUserInput {
    name: String!
    email: String!
    age: Int
  }

  input CreatePostInput {
    title: String!
    body: String!
    published: Boolean!
    author: ID!
  }
  input CreateCommentInput {
    text: String!
    author: ID!
    post: ID!
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
      const emailTaken = users.some((user) => user.email === args.data.email);
      if (emailTaken) {
        throw new Error("Email already taken.");
      }

      const user = {
        id: uuidv4(),
        ...args.data,
      };

      users.push(user);
      return user;
    },
    deleteUser(parent, args, ctx, info) {
      const userIndex = users.findIndex((user) => user.id === args.id);
      if (userIndex === -1) {
        throw new Error("User not found");
      }
      const deletedUsers = users.splice(userIndex, 1);

      posts = posts.filter((post) => {
        const match = post.author === args.id;
        if (match) {
          comments = comments.filter((comment) => comment.post !== post.id);
        }
        return !match;
      });
      comments = comments.filter((comment) => comment.author !== args.id);

      return deletedUsers[0];
    },
    createPost(parent, args, ctx, info) {
      const userExists = users.some((user) => user.id === args.data.author);
      if (!userExists) {
        throw new Error("User not found.");
      }

      const post = {
        id: uuidv4(),
        ...args.data,
      };

      posts.push(post);
      return post;
    },
    deletePost(parent, args, ctx, info) {
      const postIndex = posts.findIndex((post) => post.id === args.id);
      if (postIndex === -1) {
        throw new Error("Post not found");
      }
      const deletedPosts = posts.splice(postIndex, 1);

      comments = comments.filter((comment) => comment.post !== args.id);

      return deletedPosts[0];
    },
    createComment(parent, args, ctx, info) {
      const userExists = users.some((user) => user.id === args.data.author);
      const postExists = posts.some((post) => post.id === args.data.post && post.published);
      if (!userExists) {
        throw new Error("User not found.");
      } else if (!postExists) {
        throw new Error("Post not found.");
      }

      const comment = {
        id: uuidv4(),
        ...args.data,
      };

      comments.push(comment);
      return comment;
    },
    deleteComment(parent, args, ctx, info) {
      const commentIndex = comments.findIndex((comment) => comment.id === args.id);
      if (commentIndex === -1) {
        throw new Error("Comment not found");
      }
      const deletedComments = comments.splice(commentIndex, 1);
      return deletedComments[0];
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
