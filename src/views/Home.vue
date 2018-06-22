<template>
  <div class="home">
    <Layout class="home-layout">
      <Header class="home-header">
        <Menu class="home-nav-menu"
              mode="horizontal"
              theme="dark"
              active-name="home"
              @on-select="OnSelectNav">
          <MenuItem class="home-nav-item"
                    name="home">
          <Icon type="ios-navigate" /> 主页
          </MenuItem>
          <MenuItem class="home-nav-item"
                    name="logout">
          <Icon type="log-out" /> 登出
          </MenuItem>
        </Menu>

      </Header>
      <Layout class="home-body">
        <Sider class="home-sider">
          <Menu theme="light"
                width="auto"
                :open-names="['friends']"
                @on-select="OnSelectFriend">
            <Submenu name="friends">
              <template slot="title">
                <Icon type="ios-navigate" /> 好友
              </template>
              <MenuItem v-for="friend of friendList"
                        :key="friend.friendInfo.userName"
                        :name="friend.friendInfo.userName">{{ friend.friendInfo.nickname }}</MenuItem>
            </Submenu>
            <Submenu name="groups">
              <template slot="title">
                <Icon type="ios-keypad" /> 群组
              </template>
              <MenuItem name="g1">群组 1</MenuItem>
              <MenuItem name="g2">群组 2</MenuItem>
            </Submenu>
          </Menu>
        </Sider>
        <Layout class="home-chat"
                v-if="chatInfo">

          <Content class="home-chat-header">
            <h2>与 {{ membersWithoutMe[0]?membersWithoutMe[0].userName:'' }} 的聊天</h2>
          </Content>

          <Content class="home-chat-content">
            <MessageWindow class="message-window"
                           :messages="messages"
                           :my-user-name="user.userName" />
          </Content>

          <Content class="home-chat-input">
            <Input class="chat-textarea"
                   v-model="input"
                   @on-keydown="OnInputKeydown"
                   type="textarea"
                   :rows="5"
                   placeholder="Enter换行，Ctrl+Enter发送"></Input>
          </Content>
        </Layout>
      </Layout>
    </Layout>

  </div>
</template>

<style lang="stylus" scoped>
.home
  // 将height 100%从<html>一直传递下去，使得整个页面恰好占满屏幕
  height 100%
  position relative
  overflow hidden

  .home-layout
    height 100%

    .home-header
      padding 0 24px

      .home-nav-menu
        // inline-block宽度自适应内容
        display inline-block
        float right
        height 100%

        .home-nav-item
          // 使文字垂直居中（避免使用line-height指定固定值）
          height 100%
          display flex
          justify-content center
          align-items center

    .home-body
      height 100%

      .home-sider
        background-color #fff

      .home-chat
        padding 0 24px 24px 24px
        overflow hidden

        .home-chat-header
          flex 0 0 auto
          margin 24px 0

        .home-chat-content
          background-color #fff
          overflow auto
          display flex
          flex-direction column

          .message-window
            flex-grow 1

        .home-chat-input
          flex 0 0 auto

          /deep/ textarea
            resize none
</style>

<script lang="ts">
import Vue from 'vue';
import {
  Friend,
  LoginCredentials,
  UserComplete,
  Message,
  ChatBasic,
} from '@/models';
import vuex from '@/store';
import MessageWindow from '@/components/MessageWindow.vue';

export default Vue.extend({
  components: {
    MessageWindow,
  },
  data() {
    return {
      input: '',
    };
  },
  computed: {
    user(): UserComplete | null {
      return this.$store.state.session.currentUser;
    },
    friendList(): Friend[] {
      return this.$store.state.friends.friendList;
    },
    messages(): Message[] {
      return this.$store.state.chat.messages;
    },
    members(): UserComplete[] {
      return this.$store.state.chat.members;
    },
    membersWithoutMe(): UserComplete[] {
      return this.$store.getters.chatMembersWithoutMe;
    },
    chatInfo(): ChatBasic | null {
      return this.$store.state.chat.basicInfo;
    },
  },
  created() {
    this.$store.dispatch('getFriendList');
  },
  methods: {
    OnSelectNav(target: string) {
      switch (target) {
        case 'logout':
          this.$router.push({ name: 'login' });
          break;

        default:
          break;
      }
    },
    OnSelectFriend(friendName: string) {
      for (const friend of this.friendList) {
        if (friend.friendInfo.userName === friendName) {
          this.$store.dispatch('getChat', friend.chatInfo);
          break;
        }
      }
    },
    OnInputKeydown(event: KeyboardEvent) {
      if (event.keyCode === 13 && event.ctrlKey) {
        this.$store.dispatch('sendMessage', this.input);
      }
    },
  },
  async beforeRouteEnter(to, from, next) {
    if (!vuex.state.session.currentUser) {
      const resumedUser = await vuex.dispatch('tryResumeSession');
      if (!resumedUser) {
        // 恢复会话失败，需要重新登陆
        next({ name: 'login' });
        return;
      }
    }
    next();
  },
});
</script>
