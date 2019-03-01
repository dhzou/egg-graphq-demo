# egg
## 快速入门
<!-- 在此次添加使用文档 -->
如需进一步了解，参见 [egg 文档][egg]。
### 快速初始化项目
````
$ npm i egg-init -g
$ egg-init egg-example --type=simple
$ cd egg-example
$ npm i
````
此时项目结构:
````
├── README.md
├── app
│   ├── controller
│   │   └── home.js
│   └── router.js
├── config
│   ├── config.default.js
│   └── plugin.js
├── node_modules
├── package.json
└── test
    └── app
        └── controller
            └── home.test.js


````
启动项目:
````
$ npm run dev
$ open localhost:7001
````
   
# mysql
## centos7 安装mysql
````
wget http://repo.mysql.com/mysql-community-release-el7-5.noarch.rpm
sudo rpm -ivh mysql-community-release-el7-5.noarch.rpm
sudo yum install mysql-server

service mysqld restart
mysql -u root
use mysql
update user set password=password('123456') where user='root';
exit;
service mysqld restart
mysql -u root
use mysql

Grant all privileges on *.* to 'root'@'%' identified by '123456' with grant option;
flush privileges; 
````

## egg-sequelize
 采用sequelize orm框架
 - 安装
 ````
 npm install --save egg-sequelize mysql2
 ````
 
 - 引入并配置egg-sequelize 插件
 ````
 config/plugin    引入插件，在application启动时将会直接挂在上去
 exports.sequelize = {
   enable: true,
   package: 'egg-sequelize',
 };
 
 config/config.default 在不同环境中配置不同的sequelize配置
   const config = {
     sequelize: {
       dialect: 'mysql',
       dialectOptions: {
         charset: 'utf8mb4',
       },
       host: 'localhost',
       port: '3306',
       database: 'graphql',
       username: 'root',
       password: '123456',
       timezone: '+08:00'
     }
 ````
 
## GraphQL
- 安装
````
npm install apollo-server-koa
npm install apollo-server-module-graphiql
npm install graphql
npm install graphql-tools
````
- 配置graphql
````
  config/config.default  
  config.graphql = {
    router: '/graphql',
    graphiql: true,  // 启动graphiql tool 接口面板
  };
  配置graphql middleware 匹配所有graphql请求
  config.middleware = [ 'graphql' ];
  
````
- 编写graphql 中间件 在app目录下创建middleware/graphql.js
````
'use strict';
const { graphqlKoa } = require('apollo-server-koa/dist/koaApollo');
const { resolveGraphiQLString } = require('apollo-server-module-graphiql');
function graphiqlKoa(options) {   // 返回 graphiql 查询js
  return ctx => {
    return resolveGraphiQLString(ctx.request.query, options, ctx)
      .then(graphiqlString => {
        ctx.set('Content-Type', 'text/html');
        ctx.body = graphiqlString;
      });
  };
}

module.exports = ({
  graphiql = true,
  onPreGraphiQL,
  onPreGraphQL,
}, app) => async (ctx, next) => {
  if (ctx.path.endsWith('/graphql') || ctx.path.endsWith('/graphql?')) {
    if (ctx.request.accepts([ 'json', 'html' ]) === 'html' && graphiql) {
      if (onPreGraphiQL) {
        await onPreGraphiQL(ctx);
      }
      return graphiqlKoa({
        endpointURL: ctx.path,
      })(ctx);
    }
    if (onPreGraphQL) {
      await onPreGraphQL(ctx);
    }
    await graphqlKoa({  // 真正调用graphql服务
      schema: app.schema,
      context: ctx,
      tracing: true,
      formatResponse(data) { // data 为返回到前端的全部数据  all为执行resolve相关的信息 类似ctx
        delete data.extensions;
        return data;
      },
    })(ctx);
  }
  await next();
};

````
- 将schema合并并挂载在全局app上
````
  graphqlKoa({  // 真正调用graphql服务
      schema: app.schema,
      context: ctx,
      tracing: true,
      formatResponse(data) { // data 为返回到前端的全部数据  all为执行resolve相关的信息 类似ctx
        delete data.extensions;
        return data;
      },
    })(ctx);
  }
  我们需要将我们后台schema挂载在app上，才能查找，故在 app启动时，将其所有的schema合并挂载
 
````
  在根目录创建app.js
  ````
  module.exports = app => {
    app.beforeStart(async () => {
      require('./app/lib/index')(app);
    });
  };

  ````
  编写schema合并代码，详情请见/lib/index.js
  
- 编写schema  在app目录下创建graphql/query.js 、mutation.js
````
type Query {
    #用户信息
    user(id:Int!):UserInfo!,
}
type Mutation {
    # 阅文登录
    userLogin(ywGuid: String!,ywKey: String!): MessageWithToken!
}
````
- 定义type 
````
type UserInfo {
    id: ID! #id
    nickName: String #昵称
    avatar:String #头像
}

type MessageWithToken {
    code:Int!
    msg:String!
    token:String!
}
````
- 定义Resolve解析器 
````
  Query: {
    async user(root, { id }, ctx) {
      const params = { id };
      return await {
        id: 1,
         nickName: "dhzou",
         avatar:"ttp"
      };
    },
  },
  Mutation: {
    async userLogin(root, { ywGuid, ywKey }, ctx) {
      const params = {
        ywGuid,
        ywKey,
      };
      return await  {
        code:123,
        msg:"nicee",
        token:"nddd"
      }
    },
  },
````
- app目录结构
````
app
├── controller
│   └── home.js
├── graphql
│   ├── mutation.graphql
│   ├── query.graphql
│   ├── user.graphql
│   └── user.js
├── lib
│   ├── index.js
│   └── utils.js
├── middleware
│   └── graphql.js
├── public
└── router.js

````
启动项目:
````
$ npm run dev
$ open localhost:7001/graphql
````

### service 编写

- 编写model 创建model文件 user.js （与数据库字段对应）
````
'use strict';
const moment = require('moment');
module.exports = app => {
  const { STRING, DATE, BIGINT, INTEGER } = app.Sequelize;
  const User = app.model.define('users', {
    id: {
      type: BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    nickName: {
      type: STRING(255),
      allowNull: false,
    },
    avatar: {
      type: STRING(255),
      allowNull: true,
    },
    createTime: {
      type: DATE,
      get() {
        return moment(this.getDataValue('createTime')).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    updateTime: {
      type: DATE,
      get() {
        return moment(this.getDataValue('updateTime')).format('YYYY-MM-DD HH:mm:ss');
      },
    },

  }, {
    freezeTableName: true,
    createdAt: 'createTime',
    updatedAt: 'updateTime',
    tableName: 'users',
  });

  return User;
};

  ````
 -  在app目录下创建service目录，创建user.js service文件编写curd函数
 
 ````
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
    return await this.ctx.model.User.findOne({ where: { id: params.id } });
  }


}

module.exports = UserService;
 ````
 - 修改 graphql/user.js 的 resolve
 ````
   Query: {
     async user(root, { id }, ctx) {
       const params = { id };
       return await ctx.service.user.select(params);
     },
   }
 ````  
 启动项目：
 ````
 $ npm run dev
 $ open localhost:7001/graphql
 
 query{
 user(id:1){
   id
   avatar
   nickName
 }
 }
 
 res：
 {
   "data": {
     "user": {
       "id": "1",
       "avatar": null,
       "nickName": "邹东辉"
     }
   }
 }
 ````


## 技术服务
### node调用taf服务
- 安装架包(只能在idc机器才行，本地无法下载)
 ````
   npm install @tencent/taf-rpc
   npm install @tencent/taf-stream
 ````
- jce2node(将jce接口文件转成对应的 proxy.js代码)
  ````
    git clone http://git.code.oa.com/taf/jce2node.git
    jce2node -clinet jcefile
  ````
- 调用
````
    const Taf = require('@tencent/taf-rpc').client;
    const servant = require('./smsserviceProxy').servant;
    return new Promise((resolve, reject) => {
      const send = new servant.SmsSend();    // 根据接口构造参数对象  params
      const tafConfPath = path.join(__dirname, '../../../../conf/QDNode.YUXYhjhNodeServer.config.conf');
      Taf.initialize(tafConfPath); // 初始化taf ，tafnode部署时，locator主控自动下发
      const prx = Taf.stringToProxy(servant.SmsProxy, 'Unite.SmsService.SmsSendObj');
      prx.sendSms(send).then(result => {  // rpc调用
          resolve(result);
        } else {
          reject('commonResult is null');
        }
      }, error => {
        reject(error);
      });
    });
```` 
### node 调用cos 的l5服务
- 架包
````
   npm install @tencent/node-cl5
````
- 注册sid（不存在该服务）

- 通过 modid与cmdid 获取ip与port 并注册cos服务

````
  const cl5 = require('@tencent/node-cl5');
        this.qosClient = new cl5.CQosClient(64283073, 131072);
        this.qosClient.ApiGetRoute(timeout, (err, ip, port) => {
          if (err) {
            reject(err);
          }
          this.cos = new COS({
            Protocol: 'http:',
            SecretId: config.SecretId,
            SecretKey: config.SecretKey,
            FileParallelLimit: 3, // 控制文件上传并发数
            ChunkParallelLimit: 8, // 控制单个文件下分片上传并发数，在同园区上传可以设置较大的并发数
            ChunkSize: 1024 * 1024, // 控制分片大小，单位 B，在同园区上传可以设置较大的分片大小
            Domain: ip + ':' + port,
          });
          // 获取ip和port成功后，必须调用ApiRouteResultUpdate(status, elapsedTime, callback)上报服务器状态
          // 其中，status是调用ip和port服务的状态，0表示调用成功，<0表示出错。elapsedTime是调用服务的耗时，单位为毫秒
          setTimeout(() => {
            this.qosClient.ApiRouteResultUpdate(0, 5, function(err) {
              if (err) {
                reject(err);
              }
              resolve(true);
            });
          }, 5);
        });
````

### 阅文统一登录
- 申请阅文内部统一AppID和AreaID （胡响军）
- 前端调用
````
  // 阅文统一登录
  authLogin() {
    yw.setParams({
      appId: 55,
      areaId: 1,
      returnUrl:"http://oayh.yuewen.com" + $nuxt.$route.path + "?loginstatus=1",
      tab: type,
      unionshow: 0
    });
    yw.showYwui(); // 呼出弹窗页面
  }

````
- 前端回掉获取cookies中的 ywguid与ywkey

- 传给服务端进行权限验证
````
 // 调用taf服务权限验证
 const Taf = require('@tencent/taf-rpc').client;
    const servant = require('./YuewenAuthenTicketServantProxy').yuewenauthenticketservant;
    return new Promise((resolve, reject) => {
      const verifyInParam = new servant.VerifyInParam();
      verifyInParam.appId = businessConfig.oauthConfig.appid;
      verifyInParam.areaId = businessConfig.oauthConfig.areaId;
      verifyInParam.moduleId = 0;
      verifyInParam.serviceUrl = businessConfig.oauthConfig.serviceUrl;
      verifyInParam.ywGuid = ywGuid;
      verifyInParam.ywKey = ywKey;
      verifyInParam.remoteIp = remoteIp;
      verifyInParam.referer = referer;
      const tafConfPath = path.join(__dirname, '../../../../conf/QDNode.YUXYhjhNodeServer.config.conf');
      Taf.initialize(tafConfPath);
      const prx = Taf.stringToProxy(servant.YuewenAuthenTicketProxy, 'UserBase.YuewenAuthenTicketServer.YuewenAuthenTicketServant');
      prx.verify(verifyInParam).then(result => {
        console.log('success=', result);
        if (result && result.response && result.response.arguments && result.response.arguments.outParam) {
          resolve(result.response.arguments.outParam);
        } else {
          reject('commonResult is null');
        }
      }, error => {
        console.log('error=', error);
        reject(error);
      });
    });
````

### 接入短信模块
- 申请短信模版  [乐享](https://yuewen.lexiangla.com/teams/k100076/docs/8ae628f6d2a311e893735254002ec14d?lxref=search-company&company_from=yuewen)
- taf调用短信服务


###GraphQL [中文文档](http://graphql.cn/learn/)

###Sequelize [github](https://github.com/demopark/sequelize-docs-Zh-CN)

###DataLoader [github](https://github.com/facebook/dataloader)
