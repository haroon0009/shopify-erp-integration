import crypto from "crypto";
import getRawBody from "raw-body";

import { ENV_SHOPIFY_API_SECRET } from "../config/index.js";

export const validateWebhook = async (req, res, next) => {
  try {
    const hmac = req.header("X-Shopify-Hmac-Sha256");
    const shop_name = req.header("X-Shopify-Shop-Domain");
    const rawBody = await getRawBody(req);
    const genHash = crypto
      .createHmac("sha256", ENV_SHOPIFY_API_SECRET)
      .update(rawBody, "utf8", "hex")
      .digest("base64");
    if (hmac !== genHash) return res.status(401).send("Unauthorized");
    req.body = JSON.parse(rawBody.toString("utf8"));
    req.shop_name = shop_name;
    next();
  } catch (error) {
    console.log("WEB HOOK VALIDATION ERROR", error);
    res.status(401).send("Unauthorized");
  }
};
