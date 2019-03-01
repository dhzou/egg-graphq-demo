/* jshint indent: 2 */
'use strict';
const moment = require('moment');
module.exports = app => {
  // const { STRING, DATE, BIGINT, INTEGER } = app.Sequelize;
  // const User = app.model.define('users', {
  //   id: {
  //     type: BIGINT,
  //     allowNull: false,
  //     primaryKey: true,
  //     autoIncrement: true,
  //   },
  //   nickName: {
  //     type: STRING(255),
  //     allowNull: false,
  //   },
  //   avatar: {
  //     type: STRING(255),
  //     allowNull: true,
  //   },
  //   createTime: {
  //     type: DATE,
  //     get() {
  //       return moment(this.getDataValue('createTime')).format('YYYY-MM-DD HH:mm:ss');
  //     },
  //   },
  //   updateTime: {
  //     type: DATE,
  //     get() {
  //       return moment(this.getDataValue('updateTime')).format('YYYY-MM-DD HH:mm:ss');
  //     },
  //   },
  //
  // }, {
  //   freezeTableName: true,
  //   createdAt: 'createTime',
  //   updatedAt: 'updateTime',
  //   tableName: 'users',
  // });
  //
  // return User;
};
