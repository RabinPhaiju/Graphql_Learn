const Comment = {
  author(parent, args, { prisma }, info) {
    return prisma.users.find((user) => {
      return user.id === parent.author;
    });
  },
  post(parent, args, { prisma }, info) {
    return prisma.posts.find((post) => {
      return post.id === parent.post;
    });
  },
};
export { Comment as default };
