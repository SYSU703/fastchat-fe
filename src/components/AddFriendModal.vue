<template>
  <Modal class="add-friend-modal"
         :value="isShow"
         @input="$emit('change', $event);"
         title="添加好友">
    <Row type="flex"
         align="middle">
      <Col span="4"
           style="text-align:center;">
      <label for="user-search">选择用户</label>
      </Col>
      <Col span="18">
      <Select id="user-search"
              v-model="addFriendUserNames"
              filterable
              multiple
              remote
              placeholder="搜索用户名、昵称"
              :remote-method="debouncedQueryUser"
              :loading="queryUserLoading">
        <Option v-for="user in queryUserResult"
                :key="user.userName"
                :value="user.userName"
                :label="user.userName">
          用户名: {{ user.userName }} - 昵称: {{ user.nickname }}
        </Option>
      </Select>
      </Col>
    </Row>
    <Row type="flex"
         align="middle">
      <Col span="4"
           style="text-align:center;">
      <label for="friend-req-msg">验证消息</label>
      </Col>
      <Col span="18">
      <Input id="friend-req-msg"
             v-model="friendReqMsg"
             placeholder="我是..."></Input>
      </Col>
    </Row>

    <div slot="footer">
      <Button type="text"
              size="large"
              @click="$emit('change', false);">取消</Button>
      <Button type="primary"
              size="large"
              :disabled="addFriendUserNames.length===0"
              @click="sendFriendReq">发送请求</Button>
    </div>
  </Modal>
</template>

<style lang="stylus" scoped>
.add-friend-modal
  .ivu-row-flex
    margin-bottom 12px
</style>

<script lang="ts">
import Vue from 'vue';
import { UserComplete } from '@/models';
import { Response } from '@/serviceAgent';
import { debounce } from '@/utils';
import { AxiosError } from 'axios';

export default Vue.extend({
  name: 'AddFriendModal',
  model: {
    prop: 'isShow',
    event: 'change',
  },
  props: {
    isShow: { type: Boolean, default: false },
  },
  data() {
    return {
      queryUserLoading: false,
      addFriendUserNames: [] as string[],
      friendReqMsg: '',
      debouncedQueryUser: () => {},
      queryUserResult: [] as UserComplete[],
    };
  },
  created() {
    this.debouncedQueryUser = debounce(async (query: string) => {
      this.queryUserLoading = true;
      const res = await this.$serviceAgent.findUser(query);
      this.queryUserLoading = false;
      this.queryUserResult = res.data;
    }, 300);
  },
  methods: {
    async sendFriendReq() {
      const ress: Array<
        Response<undefined> | AxiosError // eslint-disable-line indent
      > = await this.$store.dispatch('requestAddFriends', {
        names: this.addFriendUserNames,
        msg: this.friendReqMsg,
      });
      ress.forEach((res, index) => {
        if (res instanceof Error && res.response && res.response.data) {
          this.$Message.error(
            `${this.addFriendUserNames[index]} 的好友请求发送失败：${
              res.response.data.msg
            }`,
          );
        } else if ((res as any).success === true) {
          this.$Message.success(
            `${this.addFriendUserNames[index]} 的好友请求发送成功`,
          );
        } else {
          throw res;
        }
      });
    },
  },
});
</script>

