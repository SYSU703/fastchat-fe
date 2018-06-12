# fastchat-fe

## FastChat 简介
FastChat 是一款基于 Web 开发的即时通讯系统，它主打以下三个优势：
* 本项目拥有浏览器客户端，因此它是**跨平台、无需安装**的。
* 本项目前后端都使用docker来部署，致力于“一个命令即可使用”的**部署简便性**。
* 本项目是开源的，因此用户可以轻松地在自己的服务器上部署**私有、安全**的聊天服务。

## fastchat-fe 项目介绍
`fastchat-fe`就是`Fastchat`的Web客户端。 
它的技术栈如下：
* 轻量高效的运行时支持库：vuejs + vuex + vue-router + vue-resource + iview组件库。
* 低容错性的开发环境：typescript + vetur + eslint + tslint。
* 现代化的构建工具：@vue/cli (webpack + vue-loader + ts-loader + babel-loader + ……)。
<!-- TODO: 需要写一篇文章来解释这些开发工具是如何work的，webpack中的config也需要解释 -->

`fastchat-fe`将会把数据通讯层实现为抽象层。这样，开发者只需要实现通讯层的接口，就可以把`fastchat-fe`配合其他即时通讯系统后端使用。

## 开发命令
安装依赖：
```bash
yarn install
```

启动开发服务器：
```bash
yarn serve
```

构建容器：
```bash
docker build -f ./fastchat_fe.dockerfile .
```

