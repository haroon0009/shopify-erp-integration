import axios from "axios";
import { API_VERSION, SHOPIFY_API_DELAY } from "../config/index.js";
import sleep from "../lib/sleep.js";

export class ShopifyService {
  shop_name = null;
  access_token = null;
  axios = null;

  constructor({ shop_name, accessToken }) {
    this.shop_name = shop_name;
    this.accessToken = accessToken;

    this.init();
  }

  init() {
    const service = axios.create({
      baseURL: `https://${this.shop_name}/admin/api/${API_VERSION}`,
    });

    service.interceptors.request.use(
      (config) => {
        config.headers["Content-Type"] = "application/json";
        config.headers["X-Shopify-Access-Token"] = this.accessToken;
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    service.interceptors.response.use(
      async (config) => {
        const { headers } = config;
        await this.checkForApiLimit(headers);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.axios = service;
    return this;
  }

  limitExceed(requestMade) {
    if (!requestMade) return false;
    const arr = requestMade.split("/");
    const current = arr[0];
    if (current > 30) return true;
    return false;
  }

  async checkForApiLimit(headers) {
    let apiLimit = headers["x-shopify-shop-api-call-limit"];
    console.log(apiLimit);
    if (this.limitExceed(apiLimit)) return sleep(5000);
    return sleep(SHOPIFY_API_DELAY);
  }

  async get(path) {
    return this.axios.get(path);
  }

  async post(path, body = {}) {
    return this.axios.post(path, body);
  }

  async delete(path) {
    return this.axios.delete(path);
  }
}
