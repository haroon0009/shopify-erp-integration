import { ShopifyService } from "../service/index.js";

export const fetchShopifyShop = async (shop) => {
  if (!shop) return false;
  try {
    const { shop_name, accessToken } = shop;
    const axios = new ShopifyService({ shop_name, accessToken });
    const resp = await axios.get("/shop.json");
    const shopifyShop = resp.data.shop;
    if (!shopifyShop) return false;
    return shopifyShop;
  } catch (error) {
    return false;
  }
};
