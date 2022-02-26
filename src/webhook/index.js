import { ShopModal } from "../model/index.js";
import { ShopifyService } from "../service/index.js";
import { ENV_HOST } from "../config/index.js";
import { ERP_SERVICE } from "../service/erp-service.js";

export const registerWebhooks = async (session) => {
  try {
    const { accessToken, shop } = session;
    const axios = new ShopifyService({ shop_name: shop, accessToken });
    const urlPrefix = ENV_HOST;
    const allWebhooks = [
      {
        topic: "app/uninstalled",
        address: `${urlPrefix}/webhook/uninstall-shop`,
      },
      {
        topic: "orders/cancelled",
        address: `${urlPrefix}/webhook/orders-cancelled`,
      },
      {
        topic: "orders/create",
        address: `${urlPrefix}/webhook/orders-create`,
      },
      {
        topic: "orders/fulfilled",
        address: `${urlPrefix}/webhook/orders-fulfilled`,
      },
      {
        topic: "orders/paid",
        address: `${urlPrefix}/webhook/orders-paid`,
      },
      {
        topic: "orders/partially_fulfilled",
        address: `${urlPrefix}/webhook/orders-partially-fulfilled`,
      },
      {
        topic: "orders/updated",
        address: `${urlPrefix}/webhook/orders-updated`,
      },
      {
        topic: "customers/create",
        address: `${urlPrefix}/webhook/customer-create`,
      },
    ];

    const webHookFun = allWebhooks.map((webhook) => {
      return axios.post("/webhooks.json", {
        webhook: {
          topic: webhook.topic, //"app/uninstalled",
          address: webhook.address,
          format: "json",
        },
      });
    });

    const respArr = await Promise.all(webHookFun);
    const shopExist = await ShopModal.findOne({ shop_name: shop });

    if (shopExist) {
      shopExist.webhooks = respArr.map((resp) => {
        const webhook = resp.data.webhook;
        return {
          address: webhook.address,
          webhook_id: webhook.id,
          webhook_topic: webhook.topic,
        };
      });

      await shopExist.save();
    }
    console.log("ALL WEBHOOKS REGISTERED SUCCESSFULLY...! ");
  } catch (error) {
    console.log("WEBHOOK REGISTRATION ERROR", error);
  }
};

export const uninstallShopHandler = async (body) => {
  const { myshopify_domain } = body;
  const shop = await ShopModal.findOne({ shop_name: myshopify_domain });
  if (shop) shop.remove();
};

export const webhookHandler = ({ path, body }) => {
  ERP_SERVICE.post(path, body)
    .then((resp) => {
      console.log(path, "  webhook process successfully...!");
    })
    .catch((err) => {
      console.log(path, "==>>WEBHOOK PROCESS FAILED");
      console.log(err);
    });
};
