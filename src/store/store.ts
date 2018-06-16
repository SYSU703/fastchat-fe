import Vue from 'vue';
import Vuex from 'vuex';
import sessionStore from './sessionStore';
import friendStore from './friendStore';

Vue.use(Vuex);

export default new Vuex.Store({
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
