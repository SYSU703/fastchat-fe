import Vue from 'vue';
import VueResource from 'vue-resource';
import { SERVER_ADDR } from '@/constants';

Vue.use(VueResource);

export const SessionRS = Vue.resource(`${SERVER_ADDR}/session`);

