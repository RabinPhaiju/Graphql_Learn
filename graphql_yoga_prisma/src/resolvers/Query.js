import getUserId from "./../utils/getUserId.js";

const Query = {
  async users(parent, args, { prisma }, info) {
    if (!args.query) {
      return await prisma.user.findMany({
        include: {
          posts: true,
          comments: true,
        },
      });
    } else {
      return await prisma.user.findMany({
        where: {
          OR: [
            {
              name: {
                contains: args.query,
              },
            },
          ],
        },
        include: {
          posts: true,
          comments: true,
        },
      });
    }
  },
  async user(parent, args, { prisma }, info) {},
  async me(parent, args, { prisma, request }, info) {
    const userId = getUserId(request);

    const [user] = await prisma.user.findMany({
      where: {
        id: userId,
      },
      include: {
        posts: true,
        comments: true,
      },
    });
    return user;
  },
  async posts(parent, args, { prisma }, info) {
    if (!args.query) {
      return await prisma.post.findMany({
        where: {
          published: true,
        },
        include: {
          comments: true,
          author: true,
        },
      });
    } else {
      return await prisma.post.findMany({
        where: {
          published: true,
          OR: [
            {
              title: {
                contains: args.query,
              },
            },
          ],
        },
        include: {
          comments: true,
          author: true,
        },
      });
    }
  },
  async myPosts(parent, args, { prisma, request }, info) {
    const userId = getUserId(request);
    if (!args.query) {
      return await prisma.post.findMany({
        where: {
          authorId: userId,
        },
        include: {
          comments: true,
          author: true,
        },
      });
    } else {
      return await prisma.post.findMany({
        where: {
          authorId: userId,
          OR: [
            {
              title: {
                contains: args.query,
              },
            },
          ],
        },
        include: {
          comments: true,
          author: true,
        },
      });
    }
  },
  async post(parent, args, { prisma, request }, info) {
    const userId = getUserId(request, false);

    const [post] = await prisma.post.findMany({
      where: {
        id: args.id,
        OR: [
          {
            published: true,
          },
          {
            authorId: userId,
          },
        ],
      },
    });
    if (post) {
      return post;
    } else {
      throw new Error("Post not found.");
    }
  },
  async comments(parent, args, { prisma }, info) {
    if (!args.query) {
      return await prisma.comment.findMany({
        include: {
          post: true,
          author: true,
        },
      });
    } else {
      return await prisma.comment.findMany({
        where: {
          OR: [
            {
              text: {
                contains: args.query,
              },
            },
          ],
        },
        include: {
          post: true,
          author: true,
        },
      });
    }
  },
};

export { Query as default };
