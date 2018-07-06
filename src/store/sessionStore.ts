import Vue from 'vue';
import { UserComplete, LoginCredentials } from '@/models';
import { Module } from 'vuex';

export default {
  state: {
    currentUser: null as UserComplete | null,
  },
  mutations: {
    userChange(state, newUser: UserComplete | null): void {
      if (newUser == null || typeof newUser !== 'object' || !newUser.userName) {
        state.currentUser = null;
        return;
      }
      state.currentUser = Object.assign({}, newUser);
    },
  },
  actions: {
    async login({ dispatch, commit }, credentials: LoginCredentials) {
      const res = await Vue.serviceAgent.login(credentials);
      commit('userChange', res.data);
      dispatch('refreshAllData');
      dispatch('subscribeChanges');
      return res;
    },
    async logout({ state, commit, dispatch }) {
      const res = await Vue.serviceAgent.logout();
      if (!res.success) {
        throw new Error('登出失败');
      }
      commit('userChange', null);
      dispatch('clearFriends');
      dispatch('clearChats');
      dispatch('unSubscribeChanges');
      return res;
    },
    async tryResumeSession({ state, commit, dispatch }) {
      if (!state.currentUser) {
        const resumedUser = Vue.serviceAgent.tryResumeSession();
        if (!resumedUser) { return null; }
        commit('userChange', resumedUser);
        dispatch('refreshAllData');
        dispatch('subscribeChanges');
        return resumedUser;
      } else {
        return state.currentUser;
      }
    },
    refreshAllData({ dispatch, rootState }) {
      dispatch('getChats');
      const currentChat = rootState.chats.currentChat;
      if (currentChat) {
        dispatch('getOneChat', currentChat.chatId);
      }
      dispatch('getFriends');
      dispatch('getFriendRequests');
      dispatch('getGroupInvitations');
    },
    subscribeChanges({ commit, dispatch }) {
      Vue.serviceAgent.subscribeUpdate(
        (user) => commit('userChange', user),
        (friends) => dispatch('updateFriends', friends),
        (chats) => dispatch('updateChats', chats),
        (members) => dispatch('updateOneChatMembers', members),
      );
    },
    unSubscribeChanges() {
      Vue.serviceAgent.unsubscribeUpdate();
    },
    async changeUserInfo({ state, commit }, info: UserComplete) {
      if (!state.currentUser || state.currentUser.userName !== info.userName) {
        throw new Error(`尚未登陆/不能修改他人的信息`);
      }
      const res = await Vue.serviceAgent.changeUserInfo(info);
      if (res.success) {
        commit('userChange', Object.assign({}, state.currentUser, info));
      }
      return res;
    },
    async changePassword(
      { state },
      { oldP, newP }: { oldP: string, newP: string }) {
      if (!state.currentUser) {
        throw new Error(`尚未登陆`);
      }
      const res =
        await Vue.serviceAgent.changePassword(state.currentUser.userName, oldP, newP);
      return res;
    },
  },
} as Module<{ currentUser: UserComplete | null }, any>;
