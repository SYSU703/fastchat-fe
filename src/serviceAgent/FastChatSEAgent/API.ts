import axios, { AxiosRequestConfig } from 'axios';
import { SERVER_ADDR } from '@/constants';

export const sessionRS = createAxiosInstanceWithJWTInterceptor({
  baseURL: `${SERVER_ADDR}/session`,
});

export const usersRS = createAxiosInstanceWithJWTInterceptor({
  baseURL: `${SERVER_ADDR}/users`,
});

export const friendsRS = createAxiosInstanceWithJWTInterceptor({
  baseURL: `${SERVER_ADDR}/friends`,
});

let jwtHeader = '';

export function configJWTHeader(jwt: string) {
  jwtHeader = `Bearer ${jwt}`;
}

function JWTInterceptor(config: AxiosRequestConfig) {
  // 检测绝对路径('https://')的存在
  if (config.url && /^\s*\w+:\/\//.test(config.url)) {
    throw new Error(
      `不要在安装了JWT拦截器的axios实例上使用绝对路径，
      这些axios实例只应该被用于请求REST资源。`);
  }
  if (!config.baseURL || config.baseURL.substr(0, SERVER_ADDR.length) !== SERVER_ADDR) {
    throw new Error(`baseURL配置错误`);
  }
  if (!jwtHeader) {
    return config;
  }
  if (!config.url) { config.url = ''; }
  // 处理config.url得到API路径
  let path = (config.baseURL + config.url).substr(SERVER_ADDR.length);
  // 此时path应该类似于/users/2343#anchor1 或者 /session/4242/?query=1435 或者 /p?q=123
  // 去除url中的hash和query
  const res = /^\/[\w|\/]+/.exec(path);
  if (!res) { throw new Error(`url配置错误`); }
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
  config.withCredentials = true;
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
