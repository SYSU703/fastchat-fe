<template>
  <div>
    <h1>login</h1>
    <Slider v-model="value" range></Slider>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  data() {
    return {
      value: [20, 50],
    };
  },
});
</script>