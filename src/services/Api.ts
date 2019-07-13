import axios, { Method } from 'axios';

const BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL || '';

export const get = async (path: string) => call('get', path);
export const post = async (path: string, data: any) => call('post', path, data);
export const put = async (path: string, data: any) => call('put', path, data);
export const patch = async (path: string, data: any) => call('patch', path, data);
export const remove = async (path: string) => call('delete', path);

const call = async (method: Method, path: string, data: any = undefined) => {
    return axios({ method, url: BASE_URL + path, data });
}
