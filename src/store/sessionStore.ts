import Vue from 'vue';
import { UserComplete, LoginCredentials } from '@/models';
import { Module } from 'vuex';

export default {
  state: {
    currentUser: null as UserComplete | null,
  },
  getters: {

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
      // 登陆成功以后获取好友列表和聊天列表
      dispatch('getChats');
      dispatch('getFriends');
      dispatch('subscribeChanges');
      dispatch('getFriendRequests');
      dispatch('getGroupInvitations');
      return res;
    },
    async logout({ state, commit, dispatch }) {
      const res = await Vue.serviceAgent.logout();
      if (!res.success) {
        throw new Error('登出失败');
      }
      commit('userChange', null);
      dispatch('resetFriends');
      dispatch('resetChats');
      dispatch('unSubscribeChanges');
      return res;
    },
    async tryResumeSession({ state, commit, dispatch }) {
      if (!state.currentUser) {
        const resumedUser = Vue.serviceAgent.tryResumeSession();
        if (!resumedUser) { return null; }
        commit('userChange', resumedUser);
        // 登陆成功以后获取好友列表和聊天列表
        dispatch('getChats');
        dispatch('getFriends');
        dispatch('subscribeChanges');
        dispatch('getFriendRequests');
        dispatch('getGroupInvitations');
        return resumedUser;
      } else {
        return state.currentUser;
      }
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
    async changeUserInfo({ commit }, info: UserComplete) {
      const res = await Vue.serviceAgent.changeUserInfo(info);
      if (res.success) {
        commit('userChange', info);
      }
      return res;
    },
  },
} as Module<{ currentUser: UserComplete | null }, {}>;
