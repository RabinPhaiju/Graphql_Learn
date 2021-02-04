const users = [
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

const posts = [
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
    published: false,
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

const comments = [
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

const db = {
  users,
  posts,
  comments,
};

export { db as default };
