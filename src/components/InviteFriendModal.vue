<template>
  <Modal class="invite-friend-modal"
         :value="isShow"
         @input="$emit('change', $event);"
         title="邀请好友加入"
         ok-text="发送邀请"
         @on-ok="sendInvitation">
    <div class="select-friend-wrapper">
      <Transfer :data="friends"
                :target-keys="targetKeys"
                :render-format="renderItem"
                :titles="['未邀请', '邀请']"
                @on-change="handleChange" />
    </div>

    <div class="message-wrapper">
      <Row type="flex"
           align="middle">
        <Col span="4"
             style="text-align:center;">
        <label>验证消息</label>
        </Col>
        <Col span="18">
        <Input v-model="message"
               placeholder="这个群是..."></Input>
        </Col>
      </Row>
    </div>

    <div slot="footer">
      <Button type="text"
              size="large"
              @click="$emit('change', false);">取消</Button>
      <Button type="primary"
              size="large"
              :disabled="targetKeys.length===0"
              @click="sendInvitation();$emit('change', false);">提交</Button>
    </div>
  </Modal>
</template>

<style lang="stylus" scoped>
.invite-friend-modal
  text-align center

  .select-friend-wrapper
    display inline-block
    text-align left

  .message-wrapper
    margin-top 12px
</style>


<script lang="ts">
import Vue from 'vue';
import { FriendBasic, UserComplete, ChatComplete } from '@/models';

export default Vue.extend({
  name: 'InviteFriendModal',
  model: {
    prop: 'isShow',
    event: 'change',
  },
  props: {
    isShow: { type: Boolean, default: false },
  },
  data() {
    return {
      targetKeys: [] as string[],
      message: '',
    };
  },
  computed: {
    friends(): FriendBasic[] {
      return this.$store.getters.friendsArr.map((friend: FriendBasic) => {
        const key = friend.userName;
        // 如果该好友已经在当前群聊中，则不能向他发出邀请
        const disabled = !!this.chatInfo.chatMembers.find(
          (member: UserComplete) => member.userName === friend.userName,
        );
        return Object.assign({ key, disabled }, friend);
      });
    },
    chatInfo(): ChatComplete {
      return this.$store.state.chats.currentChat;
    },
  },
  methods: {
    renderItem(item: FriendBasic) {
      return `${item.nickname}(${item.userName})`;
    },
    handleChange(
      newTargetKeys: string[],
      direction: 'left' | 'right',
      moveKeys: string[],
    ) {
      this.targetKeys = newTargetKeys;
    },
    sendInvitation() {
      this.targetKeys.forEach(async friendName => {
        try {
          const res = await this.$serviceAgent.postGroupInvitation(
            friendName,
            this.chatInfo.chatId,
            this.message,
          );
        } catch (error) {
          if (error.response && error.response.data.msg) {
            const msg = error.response.data.msg;
            switch (msg) {
              case 'receiver already in the group':
                this.$Message.error(`用户${friendName}已经在该群聊中`);
                break;
              case 'invitation exists':
                this.$Message.info(`已经有人邀请${friendName}加入该群`);
                break;
              default:
                throw error;
            }
          } else {
            throw error;
          }
        }
      });
    },
  },
});
</script>
