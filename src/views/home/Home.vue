<template>
  <div class="home">
    <Layout class="home-layout">
      <Header class="home-header">
        <div class="userInfo">当前用户：{{ user.nickname }}({{ user.userName }})</div>
        <div class="home-nav-menu">
          <div class="home-nav-item">
            <a @click="showFriendRequestModal=true;">
              <Badge dot
                     :count="10"
                     style="line-height: inherit; vertical-align: inherit;">
                <Icon type="ios-bell-outline"
                      size="18" />
                <span>通知</span>
              </Badge>
            </a>
          </div>
          <div class="home-nav-item">
            <a @click="navLogout">
              <Icon type="log-out" />
              <span>登出</span>
            </a>
          </div>
        </div>
        <FriendRequestModal v-model="showFriendRequestModal" />
      </Header>
      <Layout class="home-body">
        <Sider class="home-sider">
          <Menu theme="light"
                width="auto"
                :open-names="['friends']"
                @on-select="onSelectItem">
            <Submenu name="friends">
              <template slot="title">
                <Icon type="ios-navigate" /> 好友
              </template>
              <MenuItem v-for="friend of friendList"
                        :key="friend.chatInfo.chatId"
                        :name="friend.chatInfo.chatId">{{ friend.friendInfo.nickname }}</MenuItem>
              <Button type="dashed"
                      long
                      icon="ios-plus-empty"
                      @click="addFriendModal = true;">添加好友</Button>
              <AddFriendModal v-model="addFriendModal" />
            </Submenu>
            <Submenu name="groups">
              <template slot="title">
                <Icon type="ios-keypad" /> 群聊
              </template>
              <MenuItem v-for="gChat of groupChats"
                        :key="gChat.chatId"
                        :name="gChat.chatId">{{ gChat.chatName }}</MenuItem>
              <Button type="dashed"
                      long
                      icon="ios-plus-empty"
                      @click="createGroup">新建群聊</Button>
            </Submenu>
          </Menu>
        </Sider>
        <Layout class="home-chat"
                v-if="chatInfo">

          <Content class="home-chat-header">
            <h2 v-if="chatInfo&&!chatInfo.isGroup">
              与 {{ membersWithoutMe[0]?membersWithoutMe[0].userName:'' }} 的聊天
            </h2>
            <h2 v-if="chatInfo && chatInfo.isGroup">
              {{ chatInfo.chatName }}
            </h2>
          </Content>

          <Content class="home-chat-content"
                   ref="container">
            <MessageWindow class="message-window"
                           :messages="messages"
                           :my-user-name="user.userName" />
          </Content>

          <Content class="home-chat-input">
            <Input class="chat-textarea"
                   v-model="chatInput"
                   @on-keydown="onInputKeydown"
                   type="textarea"
                   :rows="5"
                   placeholder="Enter换行，Ctrl+Enter发送"></Input>
          </Content>
        </Layout>
      </Layout>
    </Layout>

  </div>
</template>

<style scoped src="./home.styl"></style>

<script src="./home.ts"></script>
