const Mutation = {
  async createUser(parent, args, { prisma }, info) {
    const { name, username, email, password, role } = args.data;
    const [emailTaken] = await prisma.user.findMany({ where: { email } });
    if (emailTaken) {
      throw new Error("Email already taken.");
    }
    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password,
        role: role ? role : "USER",
      },
    });
    return user;
  },
  async deleteUser(parent, { id }, { prisma }, info) {
    const [userIndex] = await prisma.user.findMany({ where: { id } });
    if (!userIndex) {
      throw new Error("User not found");
    } else {
      const user = await prisma.user.delete({
        where: { id },
      });
      return user;
    }
  },
  async updateUser(parent, { id, data }, { prisma }, info) {
    const [userIndex] = await prisma.user.findMany({ where: { id } });

    if (!userIndex) {
      throw new Error("User not found");
    } else {
      const updateUser = await prisma.user.update({
        where: { id },
        data: data,
      });
      return updateUser;
    }
  },
  async createPost(parent, args, { pubsub, prisma }, info) {
    const { title, authorId, body, published } = args.data; //provide author from token
    const [userexist] = await prisma.user.findMany({ where: { id: authorId } });
    if (!userexist) {
      throw new Error("User not found.");
    }
    const post = await prisma.post.create({
      data: {
        title,
        body,
        published,
        authorId,
      },
    });
    return post;
  },
  async deletePost(parent, { id }, { prisma, pubsub }, info) {
    const [postIndex] = await prisma.post.findMany({ where: { id } });
    if (!postIndex) {
      throw new Error("Post not found");
    }
    const post = await prisma.post.delete({
      where: { id },
    });
    return post;

    // if (deletedPost.published) {
    //   pubsub.publish("post", {
    //     post: {
    //       mutation: "DELETED",
    //       data: deletedPost,
    //     },
    //   });
    // }

    return deletedPost;
  },
  async updatePost(parent, { id, data }, { prisma, pubsub }, info) {
    const [postIndex] = await prisma.post.findMany({ where: { id } });
    if (!postIndex) {
      throw new Error("Post not found");
    }
    const updatePost = await prisma.post.update({
      where: { id },
      data: data,
    });

    return updatePost;
  },
  async createComment(parent, args, { pubsub, prisma }, info) {
    const { text, postId, authorId } = args.data;
    const [userExist] = await prisma.user.findMany({ where: { id: authorId } });
    const [postExist] = await prisma.post.findMany({ where: { id: postId, published: true } });

    if (!userExist) {
      throw new Error("User not found.");
    } else if (!postExist) {
      throw new Error("Post not found.");
    }

    // pubsub.publish(`comment ${args.data.post}`, {
    //   comment: {
    //     mutation: "CREATED",
    //     data: comment,
    //   },
    // });
    const comment = await prisma.comment.create({
      data: {
        text,
        authorId,
        postId,
      },
    });

    return comment;
  },
  async deleteComment(parent, { id }, { pubsub, prisma }, info) {
    const [commentIndex] = await prisma.comment.findMany({ where: { id } });
    if (!commentIndex) {
      throw new Error("Comment not found");
    }

    // pubsub.publish(`comment ${deletedComment.post}`, {
    //   comment: {
    //     mutation: "DELETED",
    //     data: deletedComment,
    //   },
    // });
    const deletedComment = await prisma.comment.delete({
      where: { id },
    });
    return deletedComment;
  },
  async updateComment(parent, { id, data }, { prisma, pubsub }, info) {
    const [commentIndex] = await prisma.comment.findMany({ where: { id } });
    if (!commentIndex) {
      throw new Error("Comment not found");
    }

    // pubsub.publish(`comment ${comment.post}`, {
    //   comment: {
    //     mutation: "UPDATED",
    //     data: comment,
    //   },
    // });
    const updateComment = await prisma.comment.update({
      where: { id },
      data: data,
    });

    return updateComment;
  },
};

export { Mutation as default };
