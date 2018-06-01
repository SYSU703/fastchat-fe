<template>
  <Card style="width: 480px; margin: 0 auto;">
    <h1 slot="title">登陆</h1>
    <Form id="login-form"
          ref="loginForm"
          :model="fields"
          :rules="validateRules">

      <FormItem prop="userName">
        <Input type="text"
               v-model="fields.userName"
               placeholder="用户名">
        <Icon type="ios-person-outline"
              slot="prepend" />
        </Input>
      </FormItem>

      <FormItem prop="password">
        <Input type="password"
               v-model="fields.password"
               placeholder="密码">
        <Icon type="ios-locked-outline"
              slot="prepend" />
        </Input>
      </FormItem>

      <FormItem>
        <Button type="primary"
                @click="handleSubmit()"
                style="float: right;">登陆</Button>
        <a style="float: right; margin-right: 24px;">注册</a>
      </FormItem>

    </Form>
  </Card>
</template>

<style lang="stylus" scoped>
</style>



<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  data() {
    return {
      fields: {
        userName: '',
        password: '',
      },
      validateRules: {
        userName: [
          {
            required: true,
            message: '请输入用户名',
            trigger: 'blur',
          },
        ],
        password: [
          {
            required: true,
            message: '请输入密码',
            trigger: 'blur',
          },
          {
            type: 'string',
            min: 6,
            message: '密码不少于6个字符',
            trigger: 'blur',
          },
        ],
      },
    };
  },
  methods: {
    handleSubmit() {
      (this.$refs.loginForm as any).validate((valid: boolean) => {
        if (valid) {
          this.$Message.success('Success!');
        } else {
          this.$Message.error('Fail!');
        }
      });
    },
  },
});
</script>