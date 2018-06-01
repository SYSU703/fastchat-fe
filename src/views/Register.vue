<template>
  <Card style="width: 480px; margin: 0 auto;">
    <h1 slot="title">注册</h1>
    <Form id="register-form"
          ref="registerForm"
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

      <FormItem prop="repeatPassword">
        <Input type="password"
               v-model="fields.repeatPassword"
               placeholder="再次输入密码">
        <Icon type="ios-locked-outline"
              slot="prepend" />
        </Input>
      </FormItem>

      <FormItem>
        <Button type="primary"
                @click="handleSubmit()"
                style="float: right;">注册</Button>
        <a style="float: right; margin-right: 24px;">登陆</a>
      </FormItem>
    </Form>
  </Card>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  data() {
    return {
      fields: {
        userName: '',
        password: '',
        repeatPassword: '',
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
            message: '密码不应少于6个字符',
            trigger: 'blur',
          },
          {
            validator: (
              rule: any,
              value: string,
              callback: (err?: Error) => void,
            ) => {
              if ((this as any).fields.repeatPassword !== '') {
                (this.$refs.registerForm as any).validateField(
                  'repeatPassword',
                );
              }
              callback();
            },
            trigger: 'blur',
          },
        ],
        repeatPassword: [
          {
            required: true,
            message: '请再次输入密码',
            trigger: 'blur',
          },
          {
            validator: (
              rule: any,
              value: string,
              callback: (err?: Error) => void,
            ) => {
              if (value !== (this as any).fields.password) {
                callback(new Error('两次输入的密码必须相同'));
                return;
              }
              callback();
            },
            trigger: 'blur',
          },
        ],
      },
    };
  },
  methods: {
    handleSubmit() {
      (this.$refs.registerForm as any).validate((valid: boolean) => {
        if (valid) {
          this.$Message.success('Success!');
        } else {
          this.$Message.error('Fail!');
        }
      });
    },
    handleReset() {
      (this.$refs.registerForm as any).resetFields();
    },
  },
});
</script>
