import axios, { AxiosRequestConfig } from 'axios';
import { SERVER_ADDR } from '@/constants';

export const sessionRS = createAxiosInstanceWithJWTInterceptor({
  baseURL: `${SERVER_ADDR}/session`,
});

export const usersRS = createAxiosInstanceWithJWTInterceptor({
  baseURL: `${SERVER_ADDR}/users`,
});

let jwtHeader = '';

export function configJWTHeader(jwt: string) {
  jwtHeader = `Bearer ${jwt}`;
}

function JWTInterceptor(config: AxiosRequestConfig) {
  if (!jwtHeader || !config.url || config.url.substr(0, SERVER_ADDR.length) !== SERVER_ADDR) {
    return config;
  }

  // 处理config.url得到API路径
  let path = config.url.substr(SERVER_ADDR.length);
  // 去除url中的hash和query
  const res = /^\/[\w|\/]+/.exec(path);
  if (!res) { return config; }
  path = res[0];
  // 去除尾部'/'
  if (path[path.length - 1] === '/') {
    path = path.substr(0, path.length - 1);
  }

  switch (path) {
    case '/session':
      if (config.method === 'post') {
        // 登陆时不用加上JWT header
        return config;
      }
      break;
    case '/users':
      if (config.method === 'post') {
        // 注册时不用加上JWT header
        return config;
      }
      break;
    default:
      break;
  }

  // 走到这里还没有return的请求，需要增加JWT header
  config.headers.Authorization = jwtHeader;
  return config;
}
// 通过全局axios发送的请求也要走JWTInterceptor
axios.interceptors.request.use(JWTInterceptor);
/**
 * @description 创建axios实例时自动添加JWTInterceptor
 */
export function createAxiosInstanceWithJWTInterceptor(config?: AxiosRequestConfig) {
  const ret = axios.create(config);
  ret.interceptors.request.use(JWTInterceptor);
  return ret;
}
