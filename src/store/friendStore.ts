import Vue from 'vue';
import { FriendWithChatInfo, FriendBasic, ChatBasic } from '@/models';
import { Module } from 'vuex';

export default {
  state: {
    // https://stackoverflow.com/a/45441321
    friends: new Map() as Map<string, FriendBasic>, // 以好友userName为key
    friendsChangeTracker: 1,
  },
  getters: {
    // 如果friends先加载，chat尚未加载完成，则会出现chats与friends不一致的情况：
    // 某个好友没有对应的私聊。
    friendsAndPrivateChats(state, getters, rootState): FriendWithChatInfo[] {
      // 访问tracker使得这个getter依赖于它
      // 从而tracker改变就会触发getter更新
      if (!Number.isSafeInteger(state.friendsChangeTracker) ||
        !Number.isSafeInteger(rootState.chats.chatsChangeTracker)) {
        throw new Error(`ChangeTracker超出范围`);
      }
      const result = [];
      const friendsArr = Array.from(state.friends);
      for (const [key, friend] of friendsArr) {
        const chat = rootState.chats.chats.get(friend.chatId);
        if (!chat) {
          // ${friend.userName}没有对应的私聊，暂时不返回这个好友的相关信息
          continue;
        }
        result.push({ friendInfo: friend, chatInfo: chat });
      }
      return result;
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
    async updateFriends({ commit }, friends) {
      commit('loadFriends', friends);
    },
    async resetFriends({ commit }) {
      commit('loadFriends', null);
    },
  },
} as Module<{
  friends: Map<string, FriendBasic>;
  friendsChangeTracker: number;
}, any>;
