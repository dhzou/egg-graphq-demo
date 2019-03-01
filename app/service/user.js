'use strict';

const Service = require('egg').Service;
const tag = 'UserService';

class UserService extends Service {

  /**
   * 获取用户信息
   * @param params
   * @returns {Promise<*>}
   */
  async select(params) {
   // return await this.ctx.model.User.findOne({ where: { id: params.id } });
  }


}

module.exports = UserService;
