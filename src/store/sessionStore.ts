import Vue from 'vue';
import { User, LoginCredentials, UserState } from '@/models';
import { Module } from 'vuex';
import { SessionRS } from '@/resources';

export default {
  state: {
    currentUser: null,
  } as UserState,
  getters: {

  },
  mutations: {
    changeUser(state, user: User | null) {
      if (user == null || typeof user !== 'object' || !user.userName) {
        state.currentUser = null;
      }
      state.currentUser = Object.assign({}, user);
    },
  },
  actions: {
    async login({ state, commit }, credentials: LoginCredentials) {
      const res = await SessionRS.save(credentials);
      return res;
    },
  },
} as Module<UserState, {}>;
