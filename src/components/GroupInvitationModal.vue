<template>
  <Modal class="group-invitation-modal"
         :value="isShow"
         @input="$emit('change', $event);"
         title="待处理的群聊邀请"
         width="90">
    <Table stripe
           :columns="groupInvColumns"
           :data="pendingGroupInvitations"
           no-data-text="没有待处理的请求" />
    <div slot="footer" />
  </Modal>
</template>


<style lang="stylus" scoped>
.group-invitation-modal
  /deep/ .ivu-modal-footer
    padding 0
    border none
</style>

<script lang="ts">
import Vue from 'vue';
import { GroupInvitation, UserComplete } from '@/models';
import { formatDateTime } from '@/utils';

export default Vue.extend({
  name: 'GroupInvitationModal',
  model: {
    prop: 'isShow',
    event: 'change',
  },
  props: {
    isShow: { type: Boolean, default: false },
  },
  data() {
    return {
      groupInvColumns: [
        {
          title: '发送者',
          render: (h: any, params: { row: GroupInvitation }): any => {
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
          render: (h: any, params: { row: GroupInvitation }): any => {
            return h(
              'span',
              params.row.to === (this as any).user.userName
                ? '我'
                : `${params.row.toNickname}(${params.row.to})`,
            );
          },
        },
        {
          title: '群聊名称',
          render: (h: any, params: { row: GroupInvitation }): any => {
            return h('span', params.row.chatName);
          },
        },
        {
          title: '邀请日期',
          render: (h: any, params: { row: GroupInvitation }): any => {
            return h('span', formatDateTime(params.row.time));
          },
        },
        {
          title: '验证消息',
          render: (h: any, params: { row: GroupInvitation }) => {
            const msg = params.row.message;
            return h('span', msg ? msg : '无验证消息');
          },
        },
        {
          title: '操作',
          render: (h: any, params: { row: GroupInvitation }) => {
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
                      const res = await this.$store.dispatch(
                        'responseGroupInvitation',
                        {
                          invId: params.row.invId,
                          accept: true,
                        },
                      );
                      if (res.success) {
                        this.$Message.success(
                          `已经接受${params.row.fromNickname}(${
                            params.row.from
                          })的群聊邀请`,
                        );
                      } else {
                        this.$Message.error(
                          `发生错误，接受${params.row.fromNickname}(${
                            params.row.from
                          })的群聊邀请失败`,
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
                      const res = await this.$store.dispatch(
                        'responseGroupInvitation',
                        {
                          invId: params.row.invId,
                          accept: false,
                        },
                      );
                      if (res.success) {
                        this.$Message.success(
                          `已经拒绝${params.row.fromNickname}(${
                            params.row.from
                          })的群聊邀请`,
                        );
                      } else {
                        this.$Message.error(
                          `发生错误，拒绝${params.row.fromNickname}(${
                            params.row.from
                          })的群聊邀请失败`,
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
    pendingGroupInvitations(): GroupInvitation[] {
      return this.$store.state.chats.pendingGroupInvitations;
    },
    user(): UserComplete | null {
      return this.$store.state.session.currentUser;
    },
  },
});
</script>
