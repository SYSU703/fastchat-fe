<template>
  <Modal class="chat-members-modal"
         :value="isShow"
         @input="$emit('change', $event);"
         :title="`“${chatInfo.chatName}”的成员`"
         width="60">
    <div class="users">
      <div class="one-user"
           v-for="member in chatInfo.chatMembers"
           :key="member.userName">
        <Poptip trigger="hover">
          <Avatar :style="{backgroundColor:member.gender==='male'?'deepskyblue':'deeppink'}"
                  shape="square"
                  icon="person" />
          <div class="nickname"> {{ member.nickname }}</div>

          <div slot="content">
            <p>用户名：{{ member.userName }}</p>
            <p>昵称：{{ member.nickname }}</p>
            <p>性别：{{ member.gender==='male'?'男':'女' }}</p>
            <p>邮箱：{{ member.email }}</p>
          </div>
        </Poptip>
      </div>
    </div>
    <div slot="footer" />
  </Modal>
</template>

<style lang="stylus" scoped>
.chat-members-modal
  .users
    text-align center
    display flex
    flex-wrap wrap
    align-items center
    justify-content center

    .one-user
      flex 0 0 auto
      display inline-block
      margin 12px
      .nickname
        width 48px
        text-overflow: ellipsis;
        white-space: nowrap; 
        overflow: hidden;


  /deep/ .ivu-modal-footer
    padding 0
    border none
</style>


<script lang="ts">
import Vue from 'vue';
import { ChatComplete } from '@/models';

export default Vue.extend({
  name: 'ChatMembersModal',
  model: {
    prop: 'isShow',
    event: 'change',
  },
  props: {
    isShow: { type: Boolean, default: false },
  },
  data() {
    const arr = Array.from(Array(39)).map((x, i) => ({
      userName: `t${i}`,
      gender: Math.random() > 0.5 ? 'male' : 'female',
    }));
    return {
      test: arr,
    };
  },
  computed: {
    chatInfo(): ChatComplete | null {
      return this.$store.state.chats.currentChat;
    },
  },
});
</script>
