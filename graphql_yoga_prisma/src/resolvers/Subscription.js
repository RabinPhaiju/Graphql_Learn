const Subscription = {
  comment: {
    async subscribe(parent, args, { prisma, pubsub }, info) {
      return await pubsub.asyncIterator(`comment ${args.postId}`);
    },
  },
  post: {
    async subscribe(parent, args, { pubsub }, info) {
      return await pubsub.asyncIterator("post");
    },
  },
};

export { Subscription as default };
