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
        <router-link :to="{name:'register'}"
                     class="link-register">注册</router-link>
      </FormItem>

    </Form>
  </Card>
</template>

<style lang="stylus" scoped>
.link-register
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
  created() {
    this.$store.dispatch('logout');
  },
  methods: {
    handleSubmit() {
      (this.$refs.loginForm as any).validate(async (valid: boolean) => {
        if (valid) {
          try {
            const res = await this.$store.dispatch('login', {
              userName: this.fields.userName,
              password: this.fields.password,
            });
            // console.log(res);
            this.$Message.success('Success!');
            this.$router.push({ name: 'home' });
          } catch (error) {
            this.$Message.error('Fail!');
          }
        } else {
          this.$Message.error('Invalid!');
        }
      });
    },
  },
});
</script>