<template>
  <Card dis-hover>
    <div v-for="message of messages"
         :key="message.messageId"
         :class="{ isMyMessage: myUserName===message.from }"
         class="message-row">
      <div class="message-box">{{ message.content }}</div>
    </div>
  </Card>
</template>

<style lang="stylus" scoped>
.message-row
  margin-bottom 24px

  &.isMyMessage
    text-align right

  .message-box
    display inline-block
    border 1px solid black
    padding 3px 10px
    max-width 50%
    white-space pre-line
</style>

<script lang="ts">
import Vue from 'vue';
import { Message } from '@/models';

export default Vue.extend({
  name: 'MessageWindow',
  props: {
    messages: {
      type: Array,
      default: () => [],
    },
    myUserName: {
      type: String,
      default: '',
    },
  },
});
</script>
