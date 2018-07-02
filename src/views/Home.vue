<template>
  <div class="home">
    <Layout class="home-layout">
      <Header class="home-header">
        <Menu class="home-nav-menu"
              mode="horizontal"
              theme="dark"
              @on-select="OnSelectNav">
          <MenuItem class="home-nav-item"
                    name="notice">
          <Badge dot
                 :count="0"
                 style="line-height:inherit;">
            <Icon type="ios-bell-outline"
                  size="16" /> 通知
          </Badge>
          </MenuItem>
          <MenuItem class="home-nav-item"
                    name="logout">
          <Icon type="log-out" /> 登出
          </MenuItem>
        </Menu>

        <Modal class="notice-modal"
               v-model="noticeModal"
               title="待处理的请求"
               width="90">
          <div class="notice">
            <Table stripe
                   :columns="friendReqColumns"
                   :data="pendingFriendRequests"
                   no-data-text="没有待处理的请求" />
          </div>
          <div slot="footer" />
        </Modal>

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
                  <Button type="text"
                          @click="addFriendModal=false;">取消</Button>
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

.notice-modal
  /deep/ .ivu-modal-footer
    padding 0
    border none
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
  AddFriendRequest,
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
      noticeModal: false,
      queryUserLoading: false,
      addFriendUserNames: [],
      queryUserResult: [] as UserComplete[],
      friendReqMsg: '',
      friendReqColumns: [
        {
          title: '发送者',
          render: (h: any, params: { row: AddFriendRequest }): any => {
            return h(
              'span',
              params.row.from === (this as any).user.userName
                ? '我'
                : `${params.row.fromNickname}(${params.row.from})`,
            );
          },
        },
        {
          title: '接收者',
          key: 'to',
          render: (h: any, params: { row: AddFriendRequest }): any => {
            return h(
              'span',
              params.row.to === (this as any).user.userName
                ? '我'
                : `${params.row.toNickname}(${params.row.to})`,
            );
          },
        },
        {
          title: '请求日期',
          render: (h: any, params: { row: AddFriendRequest }): any => {
            return h('span', (this as any).formatDateTime(params.row.time));
          },
        },
        {
          title: '验证消息',
          render: (h: any, params: { row: AddFriendRequest }) => {
            const msg = params.row.message;
            return h('span', msg ? msg : '无验证消息');
          },
        },
        {
          title: '操作',
          render: (h: any, params: { row: AddFriendRequest }) => {
            if (params.row.to !== (this as any).user.userName) {
              return h('span', '等待对方处理');
            }
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    type: 'primary',
                  },
                  style: {
                    marginRight: '12px',
                  },
                  on: {
                    click: async () => {
                      const success = await this.$store.dispatch(
                        'responseFriendRequest',
                        {
                          reqId: params.row.reqId,
                          accept: true,
                        },
                      );
                      if (success)
                        this.$Message.success(
                          `已经接受${params.row.fromNickname}(${
                            params.row.from
                          })的好友请求`,
                        );
                      else
                        this.$Message.error(
                          `发生错误，接受${params.row.fromNickname}(${
                            params.row.from
                          })的好友请求失败`,
                        );
                    },
                  },
                },
                '同意',
              ),
              h(
                'Button',
                {
                  props: {
                    type: 'warning',
                  },
                  on: {
                    click: async () => {
                      const success = await this.$store.dispatch(
                        'responseFriendRequest',
                        {
                          reqId: params.row.reqId,
                          accept: false,
                        },
                      );
                      if (success)
                        this.$Message.success(
                          `已经拒绝${params.row.fromNickname}(${
                            params.row.from
                          })的好友请求`,
                        );
                      else
                        this.$Message.error(
                          `发生错误，拒绝${params.row.fromNickname}(${
                            params.row.from
                          })的好友请求失败`,
                        );
                    },
                  },
                },
                '拒绝',
              ),
            ]);
          },
        },
      ],
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
    pendingFriendRequests(): AddFriendRequest[] {
      return this.$store.state.friends.pendingRequests;
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
        case 'notice':
          this.noticeModal = true;
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
    formatDateTime(d: Date) {
      const datestring =
        d.getFullYear() +
        '-' +
        ('0' + (d.getMonth() + 1)).slice(-2) +
        '-' +
        ('0' + d.getDate()).slice(-2) +
        ' ' +
        ('0' + d.getHours()).slice(-2) +
        ':' +
        ('0' + d.getMinutes()).slice(-2);
      return datestring;
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
