<template>
  <Modal class="user-info-modal"
         title="用户信息"
         :value="isShow"
         @input="$emit('change', $event);">
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
    <div v-else
         slot="footer"
         class="custom-footer">
      <Button @click="$emit('change', false);">取消</Button>
      <Button type="primary"
              @click="$emit('submitUserInfo', Object.assign({}, editingUser));">提交</Button>
    </div>
  </Modal>
</template>

<style lang="stylus" scoped>
.user-info-modal
  .ivu-row-flex
    margin-bottom 12px

  /deep/ .ivu-modal-footer
    padding 0
    border none

  .custom-footer
    border-top 1px solid #e9eaec
    padding 12px 18px 12px 18px
    text-align right
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
