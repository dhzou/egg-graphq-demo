
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
