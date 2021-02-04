const Mutation = {
  async createUser(parent, args, { prisma }, info) {
    const { name, email, password, role } = args.data;
    // const emailTaken = await prisma.users.findFirst({
    //   where: {
    //     email: args.email,
    //   },
    // });
    // if (emailTaken) {
    //   throw new Error("Email already taken.");
    // }
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
        role: role ? role : "USER",
      },
    });
    return user;
  },
  deleteUser(parent, args, { prisma }, info) {
    const userIndex = prisma.users.findIndex((user) => user.id === args.id);
    if (userIndex === -1) {
      throw new Error("User not found");
    }
    const deletedUsers = prisma.users.splice(userIndex, 1);

    prisma.posts = prisma.posts.filter((post) => {
      const match = post.author === args.id;
      if (match) {
        prisma.comments = prisma.comments.filter((comment) => comment.post !== post.id);
      }
      return !match;
    });
    prisma.comments = prisma.comments.filter((comment) => comment.author !== args.id);

    return deletedUsers[0];
  },
  updateUser(parent, { id, data }, { prisma }, info) {
    const user = prisma.users.find((user) => user.id === id);
    if (!user) {
      throw new Error("User not found");
    }
    if (typeof data.email === "string") {
      const emailTaken = prisma.users.some((user) => user.email === data.email);
      if (emailTaken) {
        throw new Error("Email is taken.");
      }
      user.email = data.email;
    }
    if (typeof data.name === "string") {
      user.name = data.name;
    }
    if (typeof data.age !== "undefined") {
      user.age = data.age;
    }
    return user;
  },
  async createPost(parent, args, { pubsub, prisma }, info) {
    const { title, authorId, body, published } = args.data; //provide author from token

    // const userExists = await prisma.user.findFirst({
    //   where: {
    //     id: authorId,
    //   },
    // });
    // if (!userExists) {
    //   throw new Error("User not found.");
    // }

    // if (args.data.published) {
    //   pubsub.publish("post", {
    //     post: {
    //       mutation: "CREATED",
    //       data: post,
    //     },
    //   });
    // }
    const post = await prisma.post.create({
      data: {
        title,
        body,
        published,
        authorId: authorId,
      },
    });

    return post;
  },
  deletePost(parent, args, { prisma, pubsub }, info) {
    const postIndex = prisma.posts.findIndex((post) => post.id === args.id);
    if (postIndex === -1) {
      throw new Error("Post not found");
    }
    const [deletedPost] = prisma.posts.splice(postIndex, 1);

    prisma.comments = prisma.comments.filter((comment) => comment.post !== args.id);

    if (deletedPost.published) {
      pubsub.publish("post", {
        post: {
          mutation: "DELETED",
          data: deletedPost,
        },
      });
    }

    return deletedPost;
  },
  updatePost(parent, { id, data }, { prisma, pubsub }, info) {
    const post = prisma.posts.find((post) => post.id === id);
    const originalPost = { ...post };
    if (!post) {
      throw new Error("Post not found");
    }
    if (typeof data.title === "string") {
      post.title = data.title;
    }
    if (typeof data.body === "string") {
      post.body = data.body;
    }
    if (typeof data.published === "boolean") {
      post.published = data.published;

      if (originalPost.published && !post.published) {
        pubsub.publish("post", {
          post: {
            mutation: "DELETED",
            data: originalPost,
          },
        });
      } else if (!originalPost.published && post.published) {
        pubsub.publish("post", {
          post: {
            mutation: "CREATED",
            data: post,
          },
        });
      } else if (post.published) {
        pubsub.publish("post", {
          post: {
            mutation: "UPDATED",
            data: post,
          },
        });
      }
    }
    return post;
  },
  async createComment(parent, args, { pubsub, prisma }, info) {
    const { text, postId, authorId } = args.data;
    // const userExists = prisma.users.some((user) => user.id === args.data.author);
    // const postExists = prisma.posts.some((post) => post.id === args.data.post && post.published);
    // if (!userExists) {
    //   throw new Error("User not found.");
    // } else if (!postExists) {
    //   throw new Error("Post not found.");
    // }

    // pubsub.publish(`comment ${args.data.post}`, {
    //   comment: {
    //     mutation: "CREATED",
    //     data: comment,
    //   },
    // });
    const comment = await prisma.comment.create({
      data: {
        text,
        authorId: authorId,
        postId: postId,
      },
    });

    return comment;
  },
  deleteComment(parent, args, { pubsub, prisma }, info) {
    const commentIndex = prisma.comments.findIndex((comment) => comment.id === args.id);
    if (commentIndex === -1) {
      throw new Error("Comment not found");
    }
    const [deletedComment] = prisma.comments.splice(commentIndex, 1);
    pubsub.publish(`comment ${deletedComment.post}`, {
      comment: {
        mutation: "DELETED",
        data: deletedComment,
      },
    });
    return deletedComment;
  },
  updateComment(parent, { id, data }, { prisma, pubsub }, info) {
    const comment = prisma.comments.find((comment) => comment.id === id);
    if (!comment) {
      throw new Error("Comment not found");
    }
    if (typeof data.text === "string") {
      comment.text = data.text;
    }
    pubsub.publish(`comment ${comment.post}`, {
      comment: {
        mutation: "UPDATED",
        data: comment,
      },
    });

    return comment;
  },
};

export { Mutation as default };
