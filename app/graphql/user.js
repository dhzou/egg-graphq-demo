'use strict';

exports.resolver = {
  Query: {
    async user(root, { id }, ctx) {
      const params = { id };
      return await ctx.service.user.select(params);
    },
  },
  Mutation: {
    async userLogin(root, { ywGuid, ywKey }, ctx) {
      return await  {
        code:123,
        msg:"nicee",
        token:"nddd"
      }
    }
    }
};

