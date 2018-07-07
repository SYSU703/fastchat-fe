import Vue from 'vue'
import { ServiceAgent } from '@/serviceAgent';

declare module 'vue/types/vue' {
  interface Vue {
    $Message: any;
    $Modal: any;
    $serviceAgent: ServiceAgent;
  }

  interface VueConstructor {
    serviceAgent: ServiceAgent;
  }
}