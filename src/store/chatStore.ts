import Vue from 'vue';
import {
  ChatBasic,
  ChatComplete,
  chatHasChanged,
  GroupInvitation,
} from '@/models';
import { Module } from 'vuex';

export default {
  // 新增一个状态以后要记得在resetChat中清空它，登出时会调用resetChat
  state: {
    chats: new Map() as Map<string, ChatBasic>, // 以chatId为key
    chatsChangeTracker: 1,  // https://stackoverflow.com/a/45441321
    currentChat: null as ChatComplete | null,
    pendingGroupInvitations: [] as GroupInvitation[],
  },
  getters: {
    chatMembersWithoutMe(state, getters, rootState) {
      const currentUser = rootState.session.currentUser;
      if (!currentUser || !state.currentChat) { return []; }
      return state.currentChat.chatMembers
        .filter((member) => member.userName !== currentUser.userName);
    },
    privateChats(state): ChatBasic[] {
      if (!Number.isSafeInteger(state.chatsChangeTracker)) {
        throw new Error(`ChangeTracker超出范围`);
      }
      return Array.from(state.chats)
        .map((item) => item[1])
        .filter((chat) => !chat.isGroup);
    },
    groupChats(state): ChatBasic[] {
      if (!Number.isSafeInteger(state.chatsChangeTracker)) {
        throw new Error(`ChangeTracker超出范围`);
      }
      return Array.from(state.chats)
        .map((item) => item[1])
        .filter((chat) => chat.isGroup);
    },
  },
  mutations: {
    loadChats(state, chats: ChatBasic[] | null) {
      if (!chats) { chats = []; }
      const map = new Map<string, ChatBasic>();
      chats.forEach((chat) => {
        map.set(chat.chatId, chat);
      });
      state.chats = map;
    },
    loadOneChat(state, newChat: ChatComplete | null) {
      if (!newChat || typeof newChat !== 'object') {
        state.currentChat = null;
        return;
      }
      state.currentChat = { ...newChat };
    },
    loadPendingGroupInvitations(state, pendingGroupInvitations: GroupInvitation[] | null) {
      if (!pendingGroupInvitations) { pendingGroupInvitations = []; }
      state.pendingGroupInvitations = [...pendingGroupInvitations];
    },
  },
  actions: {
    async getChats({ commit, dispatch }) {
      const chats = await Vue.serviceAgent.getChats();
      commit('loadChats', chats.data);
    },
    async updateChats({ commit, state, dispatch }, chats: ChatBasic[]) {
      const oldChat = state.currentChat;
      let shouldUpdateCurrentChat = false;
      if (oldChat) {
        for (const chat of chats) {
          if (chat.chatId === oldChat.chatId && chatHasChanged(oldChat, chat)) {
            shouldUpdateCurrentChat = true;
            break;
          }
        }
      }
      commit('loadChats', chats);
      if (shouldUpdateCurrentChat) {
        dispatch('loadOneChat', oldChat!.chatId);
      }
    },
    async loadOneChat({ state, commit }, chatId: string) {
      let chat = state.chats.get(chatId) as ChatComplete;
      if (!chat) {
        throw new Error(`chatId ${chatId} 不存在`);
      }
      chat = { ...chat };
      const membersRes = await Vue.serviceAgent.getChatMembers(chatId);
      chat.chatMembers = membersRes.data;
      const messagesRes = await Vue.serviceAgent.getChatMessages(chatId);
      chat.chatMessages = messagesRes.data;
      commit('loadOneChat', chat);
    },
    async sendMessage({ state, dispatch, rootState }, content: string) {
      if (!state.currentChat) { return; }
      const messageRes
        = await Vue.serviceAgent.sendMessage(state.currentChat.chatId,
          rootState.session.currentUser.userName,
          content);
      return messageRes;
    },
    async resetChats({ state, commit }) {
      commit('loadChats', null);
      commit('loadOneChat', null);
      commit('loadPendingGroupInvitations', null);
    },
    async createGroupChat() {
      const newGroup = await Vue.serviceAgent.createGroupChat();
    },
    async getGroupInvitations({ commit }) {
      const res = await Vue.serviceAgent.getGroupInvitations();
      commit('loadPendingGroupInvitations',
        res.data.filter((inv) => inv.state === 'pending'));
    },
    async responseGroupInvitation(
      { commit },
      { invId, accept }: { invId: string, accept: boolean }) {
      const res = await Vue.serviceAgent.responseGroupInvitation(invId, accept);
      return res;
    },
  },
} as Module<{
  chats: Map<string, ChatBasic>;
  chatsChangeTracker: number;
  currentChat: ChatComplete | null;
  pendingGroupInvitations: GroupInvitation[];
}, any>;
