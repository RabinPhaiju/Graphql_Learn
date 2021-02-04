const Post = {
  author(parent, args, { prisma }, info) {
    return prisma.users.find((user) => {
      return user.id === parent.author;
    });
  },
  comments(parent, args, ctx, info) {
    return prisma.comments.filter((comment) => {
      return comment.post === parent.id;
    });
  },
};
export { Post as default };
