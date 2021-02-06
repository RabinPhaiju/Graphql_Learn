import getUserId from "../utils/getUserId.js";

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
  myPost: {
    async subscribe(parent, args, { pubsub, request }, info) {
      const userId = getUserId(request);
      return await pubsub.asyncIterator(`post ${userId}`);
    },
  },
};

export { Subscription as default };
