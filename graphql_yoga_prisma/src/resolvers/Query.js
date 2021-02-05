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
              email: {
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
  async posts(parent, args, { prisma }, info) {
    if (!args.query) {
      return await prisma.post.findMany({
        include: {
          comments: true,
          author: true,
        },
      });
    } else {
      return await prisma.post.findMany({
        where: {
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
