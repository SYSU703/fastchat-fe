<template>
  <Modal class="user-info-modal"
         :class="{ editable: editable }"
         title="用户信息"
         :value="isShow"
         @input="$emit('change', $event);"
         ok-text="提交"
         @on-ok="$emit('submitUserInfo', Object.assign({}, editingUser));">
    <Row type="flex"
         align="middle">
      <Col span="4"
           style="text-align:center;">
      <label>用户名</label>
      </Col>
      <Col span="18">
      <Input v-model="editingUser.userName"
             :disabled="true"></Input>
      </Col>
    </Row>
    <Row type="flex"
         align="middle">
      <Col span="4"
           style="text-align:center;">
      <label>昵称</label>
      </Col>
      <Col span="18">
      <Input v-model="editingUser.nickname"
             :disabled="!editable"></Input>
      </Col>
    </Row>
    <Row type="flex"
         align="middle">
      <Col span="4"
           style="text-align:center;">
      <label>性别</label>
      </Col>
      <Col span="18">
      <RadioGroup v-model="editingUser.gender">
        <Radio label="male"
               :disabled="!editable">
          <Icon type="man" />
          <span>男</span>
        </Radio>
        <Radio label="female"
               :disabled="!editable">
          <Icon type="woman" />
          <span>女</span>
        </Radio>
      </RadioGroup>
      </Col>
    </Row>
    <Row type="flex"
         align="middle">
      <Col span="4"
           style="text-align:center;">
      <label>邮箱</label>
      </Col>
      <Col span="18">
      <Input v-model="editingUser.email"
             :disabled="!editable"></Input>
      </Col>
    </Row>

    <div v-if="!editable"
         slot="footer" />
  </Modal>
</template>

<style lang="stylus" scoped>
.user-info-modal
  .ivu-row-flex
    margin-bottom 12px

  &:not(.editable) /deep/ .ivu-modal-footer
    padding 0
    border none
</style>


<script lang="ts">
import Vue from 'vue';
import { UserComplete } from '@/models';

export default Vue.extend({
  name: 'UserInfoModal',
  model: {
    prop: 'isShow',
    event: 'change',
  },
  props: {
    isShow: { type: Boolean, default: false },
    editable: { type: Boolean, default: false },
    userInfo: {
      type: Object,
      default: () => ({
        userName: '',
        nickname: '',
        email: '',
        gender: '',
      }),
    },
  },
  data() {
    return {
      editingUser: {} as UserComplete,
    };
  },
  watch: {
    isShow: {
      immediate: true,
      handler(newVal, oldVal) {
        this.editingUser = { ...this.userInfo };
      },
    },
  },
});
</script>
