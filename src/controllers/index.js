import PaginatedList from "../lib/paginated-list.js";
import { ShopifyService } from "../service/shopify-service.js";

export const getAllCustomers = async (req, res) => {
  try {
    const { shop_name, accessToken } = req.shop;
    const axios = new ShopifyService({ shop_name, accessToken });
    const customers = await PaginatedList({
      service: axios,
      path: "customers.json",
      service_name: "customers",
    });

    res.status(200).send({ customers });
  } catch (error) {
    res.status(500).send({ error: error.toString() });
  }
};
