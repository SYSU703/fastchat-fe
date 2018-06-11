import Vue from 'vue';
import Vuex from 'vuex';
import { User, Credentials } from '@/models';

export default new Vuex.Store({
  state: {
    currentUser: null as User | null,
  },
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
    login({ state, commit }, credentials: Credentials) {
      // console.log(Vue.$http)
    },
  },
});
