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
      const res = await Vue.serviceAgent.getChats();
      await dispatch('updateChats', res.data);
    },
    async updateChats({ commit, state, dispatch }, chats: ChatBasic[]) {
      const oldChat = state.currentChat;
      let shouldUpdateCurrentChat = false;
      commit('loadChats', chats);
      if (oldChat) {
        const currentChat = state.chats.get(oldChat.chatId);
        if (!currentChat) {
          // 当前加载的群聊已经消失
          commit('loadOneChat', null);
        }
        if (currentChat && chatHasChanged(oldChat, currentChat)) {
          shouldUpdateCurrentChat = true;
        }
        if (shouldUpdateCurrentChat) {
          dispatch('getOneChat', oldChat.chatId);
        }
      }
    },
    async getOneChat({ state, commit }, chatId: string) {
      let chat = state.chats.get(chatId) as ChatComplete;
      if (!chat) {
        throw new Error(`chatId ${chatId} 不存在`);
      }
      chat = { ...chat };
      const [membersRes, messagesRes]
        = await Promise.all([Vue.serviceAgent.getChatMembers(chatId),
        Vue.serviceAgent.getChatMessages(chatId)]);
      chat.chatMembers = membersRes.data;
      chat.chatMessages = messagesRes.data;
      commit('loadOneChat', chat);
    },
    async sendMessage({ state, dispatch, rootState }, content: string) {
      if (!state.currentChat) { return; }
      const messageRes
        = await Vue.serviceAgent.sendMessage(state.currentChat.chatId,
          rootState.session.currentUser.userName,
          content);
      dispatch('getChats');
      return messageRes;
    },
    async clearChats({ state, commit }) {
      commit('loadChats', null);
      commit('loadOneChat', null);
      commit('loadPendingGroupInvitations', null);
    },
    async createGroupChat({ dispatch }) {
      const newGroup = await Vue.serviceAgent.createGroupChat();
      dispatch('getChats');
    },
    async getGroupInvitations({ commit }) {
      const res = await Vue.serviceAgent.getGroupInvitations();
      commit('loadPendingGroupInvitations',
        res.data.filter((inv) => inv.state === 'pending'));
    },
    async postGroupInvitations(
      { dispatch, state },
      { names, msg }: { names: string[], msg: string }) {
      const ress = Promise.all(names.map((name) =>
        Vue.serviceAgent
          .postGroupInvitation(name, state.currentChat!.chatId, msg)
          .catch((err) => err)),
      );
      dispatch('getGroupInvitations');
      return ress;
    },
    async responseGroupInvitation(
      { dispatch },
      { invId, accept }: { invId: string, accept: boolean }) {
      const res = await Vue.serviceAgent.responseGroupInvitation(invId, accept);
      dispatch('getChats');
      dispatch('getGroupInvitations');
      return res;
    },
    async changeGroupChatName({ dispatch, state }, newChatName: string) {
      const res
        = await Vue.serviceAgent.changeGroupChatName(state.currentChat!.chatId, newChatName);
      dispatch('getChats');
      return res;
    },
  },
} as Module<{
  chats: Map<string, ChatBasic>;
  chatsChangeTracker: number;
  currentChat: ChatComplete | null;
  pendingGroupInvitations: GroupInvitation[];
}, any>;
