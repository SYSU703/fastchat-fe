import Vue from 'vue';
import Vuex from 'vuex';
import sessionStore from './sessionStore';
import friendStore from './friendStore';

Vue.use(Vuex);

// 目前vuex对typescript的支持还不是很好
// https://github.com/vuejs/vuex/issues/564
export default new Vuex.Store<any>({
  state: {

  },
  getters: {

  },
  mutations: {

  },
  actions: {

  },
  modules: {
    session: sessionStore,
    friends: friendStore,
  },
});
