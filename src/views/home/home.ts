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
import FriendRequestModal from '@/components/FriendRequestModal.vue';
import AddFriendModal from '@/components/AddFriendModal.vue';
import UserInfoModal from '@/components/UserInfoModal.vue';

export default Vue.extend({
  components: {
    MessageWindow,
    FriendRequestModal,
    AddFriendModal,
    UserInfoModal,
  },
  data() {
    return {
      chatInput: '',
      addFriendModal: false,
      showFriendRequestModal: false,
      showUserInfoModal: false,
      showConfigInfoModal: false,
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
    pendingFriendRequestsToMe(): AddFriendRequest[] {
      return (this.$store.state.friends.pendingRequests as AddFriendRequest[])
        .filter((req) => this.user && req.to === this.user.userName);
    },
  },
  watch: {
    chatInfo(
      newVal: ChatComplete | null,
      oldVal: ChatComplete | null,
    ) {
      if (!newVal || !this.$refs.container) { return; }
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
    onSelectNavItem(name: string) {
      switch (name) {
        case 'logout':
          this.$router.push({ name: 'login' });
          break;
        case 'changeInfo':
          this.showConfigInfoModal = true;
          break;
        case 'showFriendRequests':
          this.showFriendRequestModal = true;
          break;
        case 'changePassword':
          break;
        default:
          break;
      }
    },
    onSelectChatItem(itemName: string) {
      this.$store.dispatch('loadOneChat', itemName);
    },
    createGroup() {
      this.$store.dispatch('createGroupChat');
    },
    async onInputKeydown(event: KeyboardEvent) {
      if (event.keyCode === 13 && event.ctrlKey) {
        await this.$store.dispatch('sendMessage', this.chatInput);
        this.chatInput = '';
      }
    },
    async submitUserInfo(info: UserComplete) {
      try {
        const res = await this.$store.dispatch('changeUserInfo', info);
        if (res.success) {
          this.$Message.success(`修改成功`);
          this.showConfigInfoModal = false;
        }
      } catch (error) {
        if (error.response &&
          error.response.data &&
          error.response.data.data.result === 'exists') {
          this.$Message.error(`修改失败，${error.response.data.data.field}已经存在`);
        } else {
          this.$Message.error(`修改失败`);
        }
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
