import axios from 'axios';
import { SERVER_ADDR } from '@/constants';

export const sessionRS = axios.create({
  baseURL: `${SERVER_ADDR}/session`,
});

export const usersRS = axios.create({
  baseURL: `${SERVER_ADDR}/users`,
});
