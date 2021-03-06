'use strict';

exports.resolver = {
  Query: {
    async user(root, { id }, ctx) {
      const params = { id };
      return await {
        id,
        nickName:"yux",
        avatar: "yuxyuxyux"
      };
    },
  },
  Mutation: {
    async userLogin(root, { userName, password }, ctx) {
      return await  {
        code:123,
        msg:"登录成功",
        token:"yuxyuxyuxy333"
      }
    }
    }
};

