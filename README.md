##快速开发

### 快速初始化项目
````
$ npm i egg-graphql-cli -g
$ egg-graphql-cli init demo 
$ cd demo
$ npm i
````
###  启动项目 
````
$ npm run dev
$ open localhost:7001/graphql
````
### 连接mysql(无mysql，先行安装)
````
 1. config/plugin.js 
   sequelize:{
     enable: false,  ==> true // 是否启动sequelize 连接数据库
     package: 'egg-sequelize',
   } 
 2. config/ config.default.js, 修改设置对应的数据库
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

### 编写model 对应数据库中的实体表
````
/app/model user.js
const User = app.model.define('tableName',{});
````
### 定义graphql schema
````
  /app/graphql/  query.graphql 、mutation.graphql
  
  定义 type
  /app/graphql/  obj.graphql
````

### 定义resolve
````
 /app/graphql/user.js
````
### 编写service curd

````
  /app/service/user.js
````
### 编写单元测试用例

````
  /test/ app/graphql/user.test.js
  
  npm run test-graphql
````

## 逐步搭建
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
 
### GraphQL
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
    userLogin(userName: String!,password: String!): MessageWithToken!
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
    async userLogin(root, { userName, password }, ctx) {
      return await  {
        code:123,
        msg:"登录成功",
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
 - 单元测试
   ````
   采用graphql进行测试，模拟grapghql请求。目录如下
   test
   └── app
       ├── controller
       │   └── home.test.js
       └── graphql
           └── user.test.js
   添加执行脚本  
    "test-graphql": "mocha test/app/graphql/*.test.js",
   npm run test-graphql
   ````
