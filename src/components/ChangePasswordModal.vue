<template>
  <Modal class="change-password-modal"
         :value="isShow"
         @input="$emit('change', $event);"
         title="修改密码">
    <Row type="flex"
         align="middle">
      <Col span="4"
           style="text-align:center;">
      <label>旧密码</label>
      </Col>
      <Col span="18">
      <Input v-model="oldP"
             type="password"
             placeholder="旧密码"></Input>
      </Col>
    </Row>
    <Row type="flex"
         align="middle">
      <Col span="4"
           style="text-align:center;">
      <label>新密码</label>
      </Col>
      <Col span="18">
      <Input v-model="newP"
             type="password"
             placeholder="新密码"></Input>
      </Col>
    </Row>
    <Row type="flex"
         align="middle">
      <Col span="4"
           style="text-align:center;">
      <label>新密码</label>
      </Col>
      <Col span="18">
      <Input v-model="newP2"
             type="password"
             placeholder="再次输入新密码"></Input>
      </Col>
    </Row>

    <div slot="footer">
      <Button type="text"
              size="large"
              @click="$emit('change', false);">取消</Button>
      <Button type="primary"
              size="large"
              :disabled="!newP || newP!==newP2 || oldP===newP"
              @click="changePassword">提交</Button>
    </div>
  </Modal>
</template>

<style lang="stylus" scoped>
.change-password-modal
  .ivu-row-flex
    margin-bottom 12px
</style>


<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'ChangePasswordModal',
  model: {
    prop: 'isShow',
    event: 'change',
  },
  props: {
    isShow: { type: Boolean, default: false },
  },
  data() {
    return {
      oldP: '',
      newP: '',
      newP2: '',
    };
  },
  methods: {
    async changePassword() {
      try {
        const res = await this.$store.dispatch('changePassword', {
          oldP: this.oldP,
          newP: this.newP,
        });
        if (res.success) {
          this.$Message.success('修改密码成功');
        }
      } catch (error) {
        this.$Message.error('修改密码失败');
      } finally {
        this.$emit('change', false);
      }
    },
  },
});
</script>
