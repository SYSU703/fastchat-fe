<template>
  <Card style="width: 480px; margin: 0 auto;">
    <h1 slot="title">注册</h1>
    <Form id="register-form"
          ref="registerForm"
          label-position="top"
          :model="fields"
          :rules="validateRules">

      <FormItem label="用户名"
                prop="userName">
        <Input type="text"
               v-model="fields.userName"
               placeholder="用户名用于登陆，不可重复">
        </Input>
      </FormItem>

      <FormItem label="昵称"
                prop="nickname">
        <Input type="text"
               v-model="fields.nickname"
               placeholder="昵称可以重复">
        </Input>
      </FormItem>

      <FormItem label="密码"
                prop="password">
        <Input type="password"
               v-model="fields.password"
               placeholder="密码不应少于6个字符">
        </Input>
      </FormItem>

      <FormItem label="重复密码"
                prop="repeatPassword">
        <Input type="password"
               v-model="fields.repeatPassword"
               placeholder="再次输入密码">
        </Input>
      </FormItem>

      <FormItem label="邮箱"
                prop="email">
        <Input type="text"
               v-model="fields.email"
               placeholder="邮箱不可重复，用于找回密码">
        </Input>
      </FormItem>

      <FormItem label="性别"
                prop="gender">
        <RadioGroup v-model="fields.gender">
          <Radio label="male">
            <Icon type="man" />
            <span>男</span>
          </Radio>
          <Radio label="female">
            <Icon type="woman" />
            <span>女</span>
          </Radio>
        </RadioGroup>
      </FormItem>

      <FormItem>
        <Button type="primary"
                @click="handleSubmit()"
                style="float: right;">注册</Button>
        <router-link :to="{name:'login'}"
                     class="link-login">登陆</router-link>
      </FormItem>
    </Form>
  </Card>
</template>

<style lang="stylus" scoped>
.link-login
  float right
  margin-right 24px
</style>


<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  data() {
    return {
      fields: {
        userName: '',
        nickname: '',
        password: '',
        repeatPassword: '',
        email: '',
        gender: 'male',
      },
      validateRules: {
        userName: [
          {
            required: true,
            message: '请输入用户名',
            trigger: 'blur',
          },
        ],
        nickname: [
          {
            required: true,
            message: '请输入昵称',
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
        email: [
          {
            required: true,
            message: '请输入邮箱',
            trigger: 'blur',
          },
          {
            type: 'email',
            message: '请填写正确的邮箱',
            trigger: 'blur',
          },
        ],
        gender: [
          {
            required: true,
            message: '请选择性别',
            trigger: 'change',
          },
        ],
      },
    };
  },
  methods: {
    handleSubmit() {
      (this.$refs.registerForm as any).validate(async (valid: boolean) => {
        if (valid) {
          try {
            const res = await this.$serviceAgent.register({
              userName: this.fields.userName,
              password: this.fields.password,
              email: this.fields.email,
              nickname: this.fields.nickname,
              gender: this.fields.gender,
            });
            // console.log(res);
            this.$Message.success('Success!');
          } catch (error) {
            // console.log(error);
            this.$Message.error('Fail!');
          }
        } else {
          this.$Message.error('Invalid!');
        }
      });
    },
    handleReset() {
      (this.$refs.registerForm as any).resetFields();
    },
  },
});
</script>
