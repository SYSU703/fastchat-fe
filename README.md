# fastchat-fe

## FastChat 简介
FastChat 是一款基于 Web 开发的即时通讯系统，它主打以下三个优势：
* 本项目拥有浏览器客户端，因此它是**跨平台、无需安装**的。
* 本项目前后端都使用docker来部署，致力于“一个命令即可使用”的**部署简便性**。
* 本项目是开源的，因此用户可以轻松地在自己的服务器上部署**私有、安全**的通讯服务。

## fastchat-fe 项目介绍
`fastchat-fe`就是`Fastchat`的Web客户端。 
它的技术栈如下：
* 轻量高效的运行时支持库：vuejs + vuex + vue-router + vue-resource + iview组件库。
* 低容错性的开发环境：typescript + vetur + eslint + tslint。
* 现代化的构建工具：@vue/cli (webpack + vue-loader + ts-loader + babel-loader + ……)。
<!-- TODO: 需要写一篇文章来解释这些开发工具是如何work的，webpack中的config也需要解释 -->

`fastchat-fe`把数据通讯逻辑解耦为抽象类。这样，开发者只需要实现通讯层的接口，就可以把`fastchat-fe`移植到其他即时通讯系统后端使用。目前`fastchat-fe`已经兼容了[fastchat-se](https://github.com/csr632/fastchat-se)和[703-se](https://github.com/SYSU703/fastchat-se)两套完全不同的服务端。

## 设计文档
[Design Doc](./DesignDoc.md)

## 开发命令
**serve或build之前修改`/src/constants/index.ts`中的`SERVER_ADDR`常量，使它指向正确的服务端地址。**

安装依赖：
```bash
yarn install
```

启动开发服务器：
```bash
yarn serve
```

构建镜像：
```bash
docker build -t fastchatfe -f ./fastchat_fe.dockerfile .
```

运行容器：
```bash
docker run -it --name my-fastchat-fe -p 80:80 fastchatfe
```

除了手动构建和运行容器以外，你还可以将这个dockerfile用于docker-compose.yml，比如像[fastchat-se](https://github.com/csr632/fastchat-se/blob/3a4aad8a53aae15399ba98d47f66c8514efe7767/docker-compose-production.yml#L29)，这样你就可以通过`docker-compose up`一个命令来启动所有需要的服务容器了。


<!-- ****
## TODO
* 为每种数据模型（比如chat）增加extra:any字段，用于存储特定服务端需要的数据（前端不需要，但服务端需要），调用agent的函数时将extra信息一并提供，让使用者更容易实现agent
* 全局错误捕获和处理
* 增强群管理员的功能：删除成员、转移管理员、发布公告等
* 所有数据获取API使用节流化
* 删除好友
* 新消息提醒
* 显示消息时间 -->
