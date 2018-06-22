import Vue from 'vue';
import { ChatBasic, ChatComplete, Message, UserComplete } from '@/models';
import { Module } from 'vuex';

export default {
  state: {
    basicInfo: null as ChatBasic | null,
    messages: [] as Message[],
    members: [] as UserComplete[],
  },
  getters: {
    chatMembersWithoutMe(state, getters, rootState) {
      const currentUser = rootState.session.currentUser;
      return state.members.filter((member) => member.userName !== currentUser.userName);
    },
  },
  mutations: {
    switchChat(state, newChat: ChatBasic | null) {
      if (!newChat || typeof newChat !== 'object') {
        state.basicInfo = null;
        return;
      }
      state.basicInfo = { ...newChat };
    },
    loadMessages(state, messages: Message[]) {
      if (!messages || messages.length === 0) { return; }
      state.messages = [...messages];
      return;
    },
    loadMembers(state, members: UserComplete[]) {
      if (!members || members.length === 0) { return; }
      state.members = [...members];
      return;
    },
  },
  actions: {
    async loadChat({ state, commit }, chatBasic: ChatBasic) {
      commit('switchChat', chatBasic);
      const membersRes = await Vue.serviceAgent.getChatMembers(chatBasic.chatId);
      commit('loadMembers', membersRes.data);
      const messagesRes = await Vue.serviceAgent.getChatMessages(chatBasic.chatId);
      commit('loadMessages', messagesRes.data);
    },
    async sendMessage({ state, commit, rootState }, content: string) {
      if (!state.basicInfo) { return; }
      const messageRes
        = await Vue.serviceAgent.sendMessage(state.basicInfo.chatId,
          rootState.session.currentUser.userName,
          content);
    },
  },
} as Module<{
  basicInfo: ChatBasic | null;
  messages: Message[];
  members: UserComplete[];
}, any>;
