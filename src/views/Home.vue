<template>
  <div class="home">
    <Layout class="home-layout">
      <Header class="home-header">
        <Menu class="home-nav-menu"
              mode="horizontal"
              theme="dark"
              active-name="home"
              @on-select="OnSelectNav">
          <MenuItem class="home-nav-item"
                    name="home">
          <Icon type="ios-navigate" /> 主页
          </MenuItem>
          <MenuItem class="home-nav-item"
                    name="logout">
          <Icon type="log-out" /> 登出
          </MenuItem>
        </Menu>

      </Header>
      <Layout class="home-body">
        <Sider class="home-sider">
          <Menu active-name="f2"
                theme="light"
                width="auto"
                :open-names="['friends']">
            <Submenu name="friends">
              <template slot="title">
                <Icon type="ios-navigate" /> 好友
              </template>
              <MenuItem name="f1">好友 1</MenuItem>
              <MenuItem name="f2">好友 2</MenuItem>
              <MenuItem name="f3">好友 3</MenuItem>
            </Submenu>
            <Submenu name="groups">
              <template slot="title">
                <Icon type="ios-keypad" /> 群组
              </template>
              <MenuItem name="g1">群组 1</MenuItem>
              <MenuItem name="g2">群组 2</MenuItem>
            </Submenu>
          </Menu>
        </Sider>
        <Layout class="home-content">
          <Breadcrumb class="home-breadcrumb">
            <BreadcrumbItem>Home</BreadcrumbItem>
            <BreadcrumbItem>Components</BreadcrumbItem>
            <BreadcrumbItem>Layout</BreadcrumbItem>
          </Breadcrumb>
          <Content class="home-chat">
            <div class="test">
              content
              <p>current user: {{ user?user.userName:'null' }}</p>
              <FriendList :friend-list="friendList" />
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>

  </div>
</template>

<style lang="stylus" scoped>
.home
  // 将height 100%从<html>一直传递下去，使得整个页面恰好占满屏幕
  height 100%
  position relative
  overflow hidden

  .home-layout
    height 100%

    .home-header
      padding 0 24px

      .home-nav-menu
        // inline-block宽度自适应内容
        display inline-block
        float right
        height 100%

        .home-nav-item
          // 使文字垂直居中（避免使用line-height指定固定值）
          height 100%
          display flex
          justify-content center
          align-items center

    .home-body
      height 100%

      .home-sider
        background-color #fff

      .home-content
        padding 0 24px 24px 24px
        overflow hidden

        .home-breadcrumb
          margin 24px 0

        .home-chat
          background-color #fff
          padding 24px
          overflow auto

.test
  height 1200px
</style>

<script lang="ts">
import Vue from 'vue';
import FriendList from '@/components/FriendList.vue';
import { UserComplete, LoginCredentials, CurrentUser } from '@/models';
import vuex from '@/store';

export default Vue.extend({
  components: {
    FriendList,
  },
  computed: {
    user(): CurrentUser {
      return this.$store.state.session.currentUser;
    },
    friendList(): UserComplete[] {
      return this.$store.state.friends.friendList;
    },
  },
  created() {
    this.$store.dispatch('getFriendList');
  },
  methods: {
    OnSelectNav(target: string) {
      switch (target) {
        case 'logout':
          this.$router.push({ name: 'login' });
          break;

        default:
          break;
      }
    },
  },
  beforeRouteEnter(to, from, next) {
    // console.log(vuex.state.session.currentUser);
    if (!vuex.state.session.currentUser) {
      next({ name: 'login' });
      return;
    }
    next();
  },
});
</script>
