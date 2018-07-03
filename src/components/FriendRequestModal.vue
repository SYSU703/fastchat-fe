<template>
  <Modal class="friend-request-modal"
         :value="isShow"
         @input="$emit('change', $event);"
         title="待处理的请求"
         width="90">
    <div>
      <Table stripe
             :columns="friendReqColumns"
             :data="pendingFriendRequests"
             no-data-text="没有待处理的请求" />
    </div>
    <div slot="footer" />
  </Modal>
</template>

<style lang="stylus" scoped>
.friend-request-modal
  /deep/ .ivu-modal-footer
    padding 0
    border none
</style>

<script lang="ts">
import Vue from 'vue';
import { AddFriendRequest, UserComplete } from '@/models';

export default Vue.extend({
  name: 'FriendRequestModal',
  model: {
    prop: 'isShow',
    event: 'change',
  },
  props: {
    isShow: { type: Boolean, default: false },
  },
  data() {
    return {
      friendReqColumns: [
        {
          title: '发送者',
          render: (h: any, params: { row: AddFriendRequest }): any => {
            return h(
              'span',
              params.row.from === (this as any).user.userName
                ? '我'
                : `${params.row.fromNickname}(${params.row.from})`,
            );
          },
        },
        {
          title: '接收者',
          key: 'to',
          render: (h: any, params: { row: AddFriendRequest }): any => {
            return h(
              'span',
              params.row.to === (this as any).user.userName
                ? '我'
                : `${params.row.toNickname}(${params.row.to})`,
            );
          },
        },
        {
          title: '请求日期',
          render: (h: any, params: { row: AddFriendRequest }): any => {
            return h('span', (this as any).formatDateTime(params.row.time));
          },
        },
        {
          title: '验证消息',
          render: (h: any, params: { row: AddFriendRequest }) => {
            const msg = params.row.message;
            return h('span', msg ? msg : '无验证消息');
          },
        },
        {
          title: '操作',
          render: (h: any, params: { row: AddFriendRequest }) => {
            if (params.row.to !== (this as any).user.userName) {
              return h('span', '等待对方处理');
            }
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    type: 'primary',
                  },
                  style: {
                    marginRight: '12px',
                  },
                  on: {
                    click: async () => {
                      const success = await this.$store.dispatch(
                        'responseFriendRequest',
                        {
                          reqId: params.row.reqId,
                          accept: true,
                        },
                      );
                      if (success) {
                        this.$Message.success(
                          `已经接受${params.row.fromNickname}(${
                            params.row.from
                          })的好友请求`,
                        );
                      } else {
                        this.$Message.error(
                          `发生错误，接受${params.row.fromNickname}(${
                            params.row.from
                          })的好友请求失败`,
                        );
                      }
                    },
                  },
                },
                '同意',
              ),
              h(
                'Button',
                {
                  props: {
                    type: 'warning',
                  },
                  on: {
                    click: async () => {
                      const success = await this.$store.dispatch(
                        'responseFriendRequest',
                        {
                          reqId: params.row.reqId,
                          accept: false,
                        },
                      );
                      if (success) {
                        this.$Message.success(
                          `已经拒绝${params.row.fromNickname}(${
                            params.row.from
                          })的好友请求`,
                        );
                      } else {
                        this.$Message.error(
                          `发生错误，拒绝${params.row.fromNickname}(${
                            params.row.from
                          })的好友请求失败`,
                        );
                      }
                    },
                  },
                },
                '拒绝',
              ),
            ]);
          },
        },
      ],
    };
  },
  computed: {
    pendingFriendRequests(): AddFriendRequest[] {
      return this.$store.state.friends.pendingRequests;
    },
    user(): UserComplete | null {
      return this.$store.state.session.currentUser;
    },
  },
  methods: {
    formatDateTime(d: Date) {
      const datestring =
        d.getFullYear() +
        '-' +
        ('0' + (d.getMonth() + 1)).slice(-2) +
        '-' +
        ('0' + d.getDate()).slice(-2) +
        ' ' +
        ('0' + d.getHours()).slice(-2) +
        ':' +
        ('0' + d.getMinutes()).slice(-2);
      return datestring;
    },
  },
});
</script>
