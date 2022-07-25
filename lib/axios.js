'use strict';

import utils from './utils.js';
import bind from './helpers/bind.js';
import Axios from './core/Axios.js';
import mergeConfig from './core/mergeConfig.js';
import defaults from './defaults/index.js';
import formDataToJSON from './helpers/formDataToJSON.js';
import CanceledError from './cancel/CanceledError.js';
import CancelToken from './cancel/CancelToken.js';
import isCancel from './cancel/isCancel.js';
import { VERSION } from './env/data.js';
import toFormData from './helpers/toFormData.js';
import AxiosError from '../lib/core/AxiosError.js';
import spread from './helpers/spread.js';
import isAxiosError from './helpers/isAxiosError.js';

/**
 * 创建一个 Axios 实例对象
 *
 * @param {Object} defaultConfig 实例的默认配置
 *
 * @returns {Axios} 一个是新实例
 */
function createInstance(defaultConfig) {
  // 根据默认的配置，创建一个 Axios 的上下文对象
  const context = new Axios(defaultConfig);
  // 创建实例函数，把 Axios 的 request 方法的 this 指向 context
  const instance = bind(Axios.prototype.request, context);

  // 把 axios.prototype 拷贝到 instance上，并把 Axios 的自身的属性继承到 instance，this指向context
  utils.extend(instance, Axios.prototype, context, { allOwnKeys: true });

  // 拷贝上下文对象属性(默认配置和请求、相应拦截器对象)到实例上， this指向为context
  utils.extend(instance, context, { allOwnKeys: true });

  // 工厂模式创建新的 axios 实例，在封装axios的时候，多个实例就可以复用一个实例了。
  instance.create = function create(instanceConfig) {
    // 把新的实例的配置和默认配置合并一起
    return createInstance(mergeConfig(defaultConfig, instanceConfig));
  };

  // 返回该实例函数
  return instance;
}

// 使用默认配置，创建并暴露一个实例
const axios = createInstance(defaults);

// 向外暴露 Axios 类，可用于继承 
axios.Axios = Axios;


// 抛出中断和取消请求的方法
// 请求取消时，抛出 CanceledError 对象
axios.CanceledError = CanceledError;
// cancelToken，用来取消请求
axios.CancelToken = CancelToken;
// 判断请求是否被取消
axios.isCancel = isCancel; 
// axios 的版本 目前是 1.0.0-alpha.1
axios.VERSION = VERSION;
// 一个格式化方法
axios.toFormData = toFormData;

// 抛出 AxiosError 类
axios.AxiosError = AxiosError;

// CanceledError 的别名，为了向后兼容
axios.Cancel = axios.CanceledError;

// 并发请求 使用 promise 来处理
axios.all = function all(promises) {
  return Promise.all(promises);
};

// 和 axios.all 共同使用,单个形参数组参数转为多参
axios.spread = spread;

// 用作监测是否为Axios抛出的错误
axios.isAxiosError = isAxiosError;


// axios 的 form 转 JSON 的方法
axios.formToJSON = (thing) => {
  return formDataToJSON(utils.isHTMLForm(thing) ? new FormData(thing) : thing);
};

// 抛出刚刚创建的 axios 实例
export default axios;
