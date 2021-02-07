import bcrypt from "bcryptjs";
import hashPassword from "./../utils/hashPassword.js";
import generateToken from "./../utils/generateToken.js";
import getUserId from "./../utils/getUserId.js";

const Mutation = {
  async createUser(parent, args, { prisma }, info) {
    const { name, username, email, password, role } = args.data;

    const newPassword = await hashPassword(password);

    const emailTaken = await prisma.user.findUnique({ where: { email } });
    const userNameTaken = await prisma.user.findUnique({ where: { username } });
    if (emailTaken) {
      throw new Error("Email already taken.");
    } else if (userNameTaken) {
      throw new Error("Username already taken.");
    }
    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: newPassword,
        role: role ? role : "USER",
      },
    });
    return {
      user,
      token: generateToken(user.id),
    };
  },
  async loginUser(parent, args, { prisma }, info) {
    const { email, password } = args.data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error("Unable to login. Signup");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      console.log(`login user ${user.name}`);
      return {
        user,
        token: generateToken(user.id),
      };
    } else {
      throw new Error("Email or password wrong.");
    }
  },
  async deleteUser(parent, args, { prisma, request }, info) {
    const userId = getUserId(request);
    const user = await prisma.user.delete({
      where: { id: userId },
    });
    return user;
  },
  async updateUser(parent, { data }, { prisma, request }, info) {
    const userId = getUserId(request);

    const userIndex = await prisma.user.findUnique({ where: { id: userId } });
    if (!userIndex) {
      throw new Error("User not found");
    }

    if (typeof data.password === "string") {
      data.password = await hashPassword(data.password);
    }

    const updateUser = await prisma.user.update({
      where: { id: userId },
      data,
    });
    return updateUser;
  },
  async createPost(parent, args, { pubsub, prisma, request }, info) {
    const userId = getUserId(request);

    const { title, body, published } = args.data;
    const userexist = await prisma.user.findUnique({ where: { id: userId } });
    if (!userexist) {
      throw new Error("User not found.");
    }
    const post = await prisma.post.create({
      data: {
        title,
        body,
        published,
        authorId: userId,
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
    pubsub.publish(`post ${userId}`, {
      myPost: {
        mutation: "CREATED",
        node: post,
      },
    });
    return post;
  },
  async deletePost(parent, { id }, { prisma, pubsub, request }, info) {
    const userId = getUserId(request);
    const postIndex = await prisma.post.findFirst({
      where: {
        id,
        authorId: userId,
      },
    });
    if (!postIndex) {
      throw new Error("Unable to delete the post.");
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
      pubsub.publish(`post ${userId}`, {
        myPost: {
          mutation: "DELETED",
          node: post,
        },
      });
    }
    return post;
  },
  async updatePost(parent, { id, data }, { prisma, pubsub, request }, info) {
    const userId = getUserId(request);
    const postIndex = await prisma.post.findFirst({
      where: {
        id,
        authorId: userId,
      },
    });
    if (!postIndex) {
      throw new Error("Unable to update the post.");
    }
    const updatePost = await prisma.post.update({
      where: { id },
      data: data,
      include: {
        author: true,
      },
    });

    if (postIndex.published === true && data.published === false) {
      await prisma.comment.deleteMany({
        where: {
          postId: id,
        },
      });

      pubsub.publish("post", {
        post: {
          mutation: "DELETED",
          node: updatePost,
        },
      });
      pubsub.publish(`post ${userId}`, {
        myPost: {
          mutation: "DELETED",
          node: updatePost,
        },
      });
    } else if (postIndex.published === false && data.published === true) {
      pubsub.publish("post", {
        post: {
          mutation: "CREATED",
          node: updatePost,
        },
      });
      pubsub.publish(`post ${userId}`, {
        myPost: {
          mutation: "CREATED",
          node: updatePost,
        },
      });
    } else {
      pubsub.publish("post", {
        post: {
          mutation: "UPDATED",
          node: updatePost,
        },
      });
      pubsub.publish(`post ${userId}`, {
        myPost: {
          mutation: "UPDATED",
          node: updatePost,
        },
      });
    }

    return updatePost;
  },
  async createComment(parent, args, { pubsub, prisma, request }, info) {
    const { text, postId } = args.data;
    const userId = getUserId(request);
    const userExist = await prisma.user.findUnique({ where: { id: userId } });
    const postExist = await prisma.post.findFirst({ where: { id: postId, published: true } });

    if (!userExist) {
      throw new Error("Authentication required");
    } else if (!postExist) {
      throw new Error("Post not found.");
    }

    const newComment = await prisma.comment.create({
      data: {
        text,
        authorId: userId,
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
  async deleteComment(parent, { id }, { pubsub, prisma, request }, info) {
    const userId = getUserId(request);
    const commentIndex = await prisma.comment.findFirst({
      where: {
        id,
        authorId: userId,
      },
    });
    if (!commentIndex) {
      throw new Error("Unable to delete to comment");
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
  async updateComment(parent, { id, data }, { prisma, pubsub, request }, info) {
    const userId = getUserId(request);
    const commentIndex = await prisma.comment.findFirst({
      where: {
        id,
        authorId: userId,
      },
    });
    if (!commentIndex) {
      throw new Error("Unable to update the comment");
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
