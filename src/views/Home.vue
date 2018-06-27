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
              <Modal class="add-friend-modal"
                     v-model="addFriendModal"
                     title="添加好友">
                <Row type="flex"
                     align="middle">
                  <Col span="4"
                       style="text-align:center;">
                  <label for="user-search">选择用户</label>
                  </Col>
                  <Col span="18">
                  <Select id="user-search"
                          v-model="addFriendUserNames"
                          filterable
                          multiple
                          remote
                          placeholder="搜索用户名、昵称"
                          :remote-method="queryUser"
                          :loading="queryUserLoading">
                    <Option v-for="user in queryUserResult"
                            :key="user.userName"
                            :value="user.userName"
                            :label="user.userName">
                      用户名: {{ user.userName }} - 昵称: {{ user.nickname }}
                    </Option>
                  </Select>
                  </Col>
                </Row>
                <Row type="flex"
                     align="middle">
                  <Col span="4"
                       style="text-align:center;">
                  <label for="user-search">验证消息</label>
                  </Col>
                  <Col>
                  <Input v-model="friendReqMsg"
                         placeholder="我是..."></Input>
                  </Col>
                </Row>

                <div slot="footer">
                  <Button type="text">取消</Button>
                  <Button type="primary"
                          :disabled="addFriendUserNames.length===0"
                          @click="sendFriendReq">发送请求</Button>
                </div>
              </Modal>
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

.add-friend-modal
  .ivu-row-flex
    margin-bottom 12px
</style>

<script lang="ts">
import Vue from 'vue';
import {
  LoginCredentials,
  UserComplete,
  Message,
  ChatBasic,
  ChatComplete,
  FriendWithChatInfo,
  messageHasChanged,
} from '@/models';
import vuex from '@/store';
import MessageWindow from '@/components/MessageWindow.vue';

export default Vue.extend({
  components: {
    MessageWindow,
  },
  data() {
    return {
      chatInput: '',
      addFriendModal: false,
      queryUserLoading: false,
      addFriendUserNames: [],
      queryUserResult: [] as UserComplete[],
      friendReqMsg: '',
    };
  },
  computed: {
    user(): UserComplete | null {
      return this.$store.state.session.currentUser;
    },
    friendList(): FriendWithChatInfo[] {
      return this.$store.getters.friendsAndPrivateChats;
    },
    messages(): Message[] {
      const currentChat = this.chatInfo;
      return currentChat ? currentChat.chatMessages : [];
    },
    members(): UserComplete[] {
      const currentChat = this.chatInfo;
      return currentChat ? currentChat.chatMembers : [];
    },
    membersWithoutMe(): UserComplete[] {
      return this.$store.getters.chatMembersWithoutMe;
    },
    chatInfo(): ChatComplete | null {
      return this.$store.state.chats.currentChat;
    },
    groupChats(): ChatBasic[] {
      return this.$store.getters.groupChats;
    },
  },
  watch: {
    chatInfo: function(
      newVal: ChatComplete | null,
      oldVal: ChatComplete | null,
    ) {
      if (!newVal || !this.$refs.container) return;
      if (
        !oldVal ||
        messageHasChanged(oldVal.lastestMessage, newVal.lastestMessage)
      ) {
        // 消息更新时，窗口滚动到最下方
        this.$nextTick(() => {
          (this.$refs.container as any).$el.scrollTop = (this.$refs
            .container as any).$el.scrollHeight;
        });
      }
    },
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
    onSelectItem(itemName: string) {
      this.$store.dispatch('loadOneChat', itemName);
    },
    createGroup() {
      this.$store.dispatch('createGroupChat');
    },
    async queryUser(query: string) {
      this.queryUserLoading = true;
      const res = await this.$serviceAgent.findUser(query);
      this.queryUserLoading = false;
      this.queryUserResult = res.data;
    },
    async onInputKeydown(event: KeyboardEvent) {
      if (event.keyCode === 13 && event.ctrlKey) {
        await this.$store.dispatch('sendMessage', this.chatInput);
        this.chatInput = '';
      }
    },
    async sendFriendReq() {
      this.addFriendUserNames.forEach(async name => {
        try {
          const res = await this.$serviceAgent.requestAddFriend(
            name,
            this.friendReqMsg,
          );
          if (res.success === true) {
            this.$Message.success(`${name} 的好友请求发送成功`);
          }
        } catch (error) {
          if (error.response.data)
            this.$Message.error(
              `${name} 的好友请求发送失败：${error.response.data.msg}`,
            );
          else throw error;
        }
      });
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
