import getUserId from "./../utils/getUserId.js";

const User = {
  email(parent, args, { request }, info) {
    const userId = getUserId(request, false);

    if (userId && userId === parent.id) {
      return parent.email;
    }
    return null;
  },
  async posts(parent, args, { prisma }, info) {
    return await prisma.post.findMany({
      where: {
        published: true,
        authorId: parent.id,
      },
    });
  },
};
export { User as default };
