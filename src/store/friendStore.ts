import Vue from 'vue';
import { FriendWithChatInfo, FriendBasic, ChatBasic } from '@/models';
import { Module } from 'vuex';

export default {
  state: {
    // https://stackoverflow.com/a/45441321
    friends: new Map() as Map<string, FriendBasic>, // 以好友userName为key
    _friendsChangeTracker: 1,
  },
  getters: {
    // friendsAndPrivateChats必须在loadChats完成以后才可以访问
    friendsAndPrivateChats(state, getters, rootState): FriendWithChatInfo[] {
      // 访问tracker使得这个getter依赖于它
      // 从而tracker改变就会触发getter更新
      if (!Number.isSafeInteger(state._friendsChangeTracker) ||
        !Number.isSafeInteger(rootState.chats.chatsChangeTracker)) {
        throw new Error(`ChangeTracker超出范围`);
      }
      // console.log(rootState.chats.chats);
      return Array.from(state.friends).map(([key, friend]) => {
        const chat = rootState.chats.chats.get(friend.chatId);
        if (!chat) {
          throw new Error(`${friend.userName}没有对应的私聊`);
        }
        return { friendInfo: friend, chatInfo: chat };
      });
    },
  },
  mutations: {
    loadFriends(state, friends: FriendBasic[] | null) {
      if (!friends) { friends = []; }
      const map = new Map<string, FriendBasic>();
      friends.forEach((friend) => {
        map.set(friend.userName, friend);
      });
      state.friends = map;
    },
  },
  actions: {
    async getFriends({ state, commit }) {
      const res = await Vue.serviceAgent.getFriends();
      commit('loadFriends', res.data);
    },
    async resetFriends({ commit }) {
      commit('loadFriends', null);
    },
  },
} as Module<{
  friends: Map<string, FriendBasic>;
  _friendsChangeTracker: number;
}, any>;
