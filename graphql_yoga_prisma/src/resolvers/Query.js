const Query = {
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
