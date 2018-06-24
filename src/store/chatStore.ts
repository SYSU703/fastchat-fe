import Vue from 'vue';
import { ChatBasic, ChatComplete, Message, UserComplete } from '@/models';
import { Module } from 'vuex';

export default {
  state: {
    chats: new Map() as Map<string, ChatBasic>, // 以chatId为key
    chatsChangeTracker: 1,  // https://stackoverflow.com/a/45441321
    currentChat: null as ChatComplete | null,
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
  },
  actions: {
    async getChats({ commit, dispatch }) {
      const chats = await Vue.serviceAgent.getChats();
      commit('loadChats', chats.data);
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
    async sendMessage({ state, commit, rootState }, content: string) {
      if (!state.currentChat) { return; }
      const messageRes
        = await Vue.serviceAgent.sendMessage(state.currentChat.chatId,
          rootState.session.currentUser.userName,
          content);
    },
    async resetChat({ state, commit }) {
      commit('loadChats', null);
      commit('loadOneChat', null);
    },
  },
} as Module<{
  chats: Map<string, ChatBasic>;
  chatsChangeTracker: number;
  currentChat: ChatComplete | null;
}, any>;
