const Query = {
  async users(parent, args, { prisma }, info) {
    if (!args.query) {
      return await prisma.user.findMany();
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
          post: {
            include: {
              comment: true,
            },
          },
          comment: true,
        },
      });
    }
  },
  async posts(parent, args, { prisma }, info) {
    if (!args.query) {
      return await prisma.post.findMany();
    } else {
    }
  },
  async comments(parent, args, { prisma }, info) {
    if (!args.query) {
      return await prisma.comment.findMany();
    } else {
    }
  },
};

export { Query as default };
