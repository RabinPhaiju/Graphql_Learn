const Query = {
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

  users(parent, args, { db }, info) {
    if (!args.query) {
      return db.users;
    } else {
      return db.users.filter((user) => {
        return user.name.toLowerCase().includes(args.query.toLowerCase());
      });
    }
  },
  posts(parent, args, { db }, info) {
    if (!args.query) {
      return db.posts.filter((post) => {
        return post.published;
      });
    } else {
      return db.posts.filter((post) => {
        const isTitleMatch = post.title.toLowerCase().includes(args.query.toLowerCase());
        const isBodyMatch = post.body.toLowerCase().includes(args.query.toLowerCase());
        return (isTitleMatch || isBodyMatch) && post.published;
      });
    }
  },
  comments(parent, args, { db }, info) {
    if (!args.query) {
      return db.comments;
    } else {
      return db.comments.filter((comment) => {
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
};

export { Query as default };
