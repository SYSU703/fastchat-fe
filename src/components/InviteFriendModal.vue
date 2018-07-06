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
import { Response } from '@/serviceAgent';
import { AxiosError } from 'axios';

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
    async sendInvitation() {
      const ress: Array<
        Response<undefined> | AxiosError // eslint-disable-line indent
      > = await this.$store.dispatch('postGroupInvitations', {
        names: this.targetKeys,
        msg: this.message,
      });
      ress.forEach((res, index) => {
        if (res instanceof Error && res.response && res.response.data) {
          const msg = res.response.data.msg;
          switch (msg) {
            case 'receiver already in the group':
              this.$Message.error(
                `用户${this.targetKeys[index]}已经在该群聊中`,
              );
              break;
            case 'invitation exists':
              this.$Message.info(
                `已经有人邀请${this.targetKeys[index]}加入该群`,
              );
              break;
            default:
              throw res;
          }
        } else if ((res as any).success === true) {
          this.$Message.success(`${this.targetKeys[index]}的群聊邀请发送成功`);
        } else {
          throw res;
        }
      });
    },
  },
});
</script>
