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
      include: {
        author: true,
      },
    });
    pubsub.publish("post", {
      post: {
        mutation: "CREATED",
        node: post,
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
      include: {
        author: true,
      },
    });
    if (post.published) {
      pubsub.publish("post", {
        post: {
          mutation: "DELETED",
          node: post,
        },
      });
    }
    return post;
  },
  async updatePost(parent, { id, data }, { prisma, pubsub }, info) {
    const [postIndex] = await prisma.post.findMany({ where: { id } });
    if (!postIndex) {
      throw new Error("Post not found");
    }
    const updatePost = await prisma.post.update({
      where: { id },
      data: data,
      include: {
        author: true,
      },
    });
    pubsub.publish("post", {
      post: {
        mutation: "UPDATED",
        node: updatePost,
      },
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

    const newComment = await prisma.comment.create({
      data: {
        text,
        authorId,
        postId,
      },
      include: {
        author: true,
        post: true,
      },
    });
    pubsub.publish(`comment ${postId}`, {
      comment: {
        mutation: "CREATED",
        node: newComment,
      },
    });

    return newComment;
  },
  async deleteComment(parent, { id }, { pubsub, prisma }, info) {
    const [commentIndex] = await prisma.comment.findMany({ where: { id } });
    if (!commentIndex) {
      throw new Error("Comment not found");
    }
    const deletedComment = await prisma.comment.delete({
      where: { id },
      include: {
        author: true,
        post: true,
      },
    });

    pubsub.publish(`comment ${deletedComment.postId}`, {
      comment: {
        mutation: "DELETED",
        node: deletedComment,
      },
    });

    return deletedComment;
  },
  async updateComment(parent, { id, data }, { prisma, pubsub }, info) {
    const [commentIndex] = await prisma.comment.findMany({ where: { id } });
    if (!commentIndex) {
      throw new Error("Comment not found");
    }

    const updateComment = await prisma.comment.update({
      where: { id },
      data: data,
      include: {
        author: true,
        post: true,
      },
    });
    pubsub.publish(`comment ${updateComment.postId}`, {
      comment: {
        mutation: "UPDATED",
        node: updateComment,
      },
    });

    return updateComment;
  },
};

export { Mutation as default };
