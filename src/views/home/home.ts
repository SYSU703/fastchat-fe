import Vue from 'vue';
import PerfectScrollbar from 'perfect-scrollbar';
import {
  UserComplete,
  Message,
  ChatBasic,
  ChatComplete,
  FriendWithChatInfo,
  messageHasChanged,
  AddFriendRequest,
  GroupInvitation,
} from '@/models';
import vuex from '@/store';
import MessageWindow from '@/components/MessageWindow.vue';
import FriendRequestModal from '@/components/FriendRequestModal.vue';
import AddFriendModal from '@/components/AddFriendModal.vue';
import UserInfoModal from '@/components/UserInfoModal.vue';
import ChangePasswordModal from '@/components/ChangePasswordModal.vue';
import ChatMembersModal from '@/components/ChatMembersModal.vue';
import InviteFriendModal from '@/components/InviteFriendModal.vue';
import GroupInvitationModal from '@/components/GroupInvitationModal.vue';

export default Vue.extend({
  components: {
    MessageWindow,
    FriendRequestModal,
    AddFriendModal,
    UserInfoModal,
    ChangePasswordModal,
    ChatMembersModal,
    InviteFriendModal,
    GroupInvitationModal,
  },
  data() {
    return {
      chatInput: '',
      addFriendModal: false,
      showFriendRequestModal: false,
      showUserInfoModal: false,
      showConfigInfoModal: false,
      showChangePasswordModal: false,
      showChatMembersModal: false,
      showInviteFriendModal: false,
      showGroupInvitationModal: false,
      isEditingChatName: false,
      newChatName: '',
      changeChatNameLoading: false,
      sidebarScroller: null as PerfectScrollbar | null,
      resizeHandler: null as (() => void) | null,
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
    pendingGroupInvitationsToMe(): GroupInvitation[] {
      return (this.$store.state.chats.pendingGroupInvitations as GroupInvitation[])
        .filter((inv) => this.user && inv.to === this.user.userName);
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
    friendList(newVal, oldVal) {
      this.updateSidebarScroller();
    },
    groupChats(newVal, oldVal) {
      this.updateSidebarScroller();
    },
  },
  mounted() {
    const PScontainer = (this.$refs.scrollbarContainer as any).$el;
    this.sidebarScroller = new PerfectScrollbar(PScontainer);
    this.updateSidebarScroller();
    this.resizeHandler = () => {
      this.updateSidebarScroller();
    };
    window.addEventListener('resize', this.resizeHandler);
  },
  beforeDestroy() {
    // 防止内存泄露
    this.sidebarScroller!.destroy();
    this.sidebarScroller = null;
    window.removeEventListener('resize', this.resizeHandler!);
    this.resizeHandler = null;
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
          this.showChangePasswordModal = true;
          break;
        case 'showGroupInvitation':
          this.showGroupInvitationModal = true;
          break;
        default:
          break;
      }
    },
    onSelectChatOption(name: string) {
      switch (name) {
        case 'showFriendInfo':
          this.showUserInfoModal = true;
          break;
        case 'showChatMembers':
          this.showChatMembersModal = true;
          break;
        case 'inviteFriend':
          this.showInviteFriendModal = true;
          break;
        case 'quitGroup':
          this.confirmQuitGroup();
          break;
        default:
          break;
      }
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
    async changeGroupChatName() {
      this.changeChatNameLoading = true;
      try {
        const res = await this.$store.dispatch('changeGroupChatName', this.newChatName);
        if (res.success) {
          this.$Message.success('修改群名成功');
        }
      } catch (error) {
        this.$Message.error('修改群名失败');
      } finally {
        this.changeChatNameLoading = false;
        this.isEditingChatName = false;
      }
    },
    updateSidebarScroller() {
      setTimeout(() => {
        this.sidebarScroller!.update();
      }, 300);
    },
    confirmQuitGroup() {
      this.$Modal.confirm({
        title: '退出群聊',
        content: `确定要退出群聊${this.chatInfo!.chatName}吗？`,
        onOk: () => {
          this.$store.dispatch('quitGroup');
        },
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
