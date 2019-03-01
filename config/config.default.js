/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = {
     // mysql config
    // sequelize: {
    //   dialect: 'mysql',
    //   dialectOptions: {
    //     charset: 'utf8mb4',
    //   },
    //   host: 'localhost',
    //   port: '3306',
    //   database: 'graphql',
    //   username: 'root',
    //   password: '123456',
    //   timezone: '+08:00'
    // }
  };

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1551339490737_9235';

  // add your middleware config here
  config.middleware = ['graphql'];
  config.graphql = {
    router: '/graphql',
    graphiql: true,  // 启动graphiql tool 接口面板
  };
  // cors
  config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
  };
  // csrf
  config.security = {
    csrf: {
      ignore: () => true,
    },
  };


  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  return {
    ...config,
    ...userConfig,
  };
};
