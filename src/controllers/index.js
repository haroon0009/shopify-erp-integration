import PaginatedList from "../lib/paginated-list.js";
import { ShopifyService } from "../service/shopify-service.js";

function orderObject(order) {
  const {
    total_discounts,
    total_price,
    fulfillments,
    line_items,
    contact_email,
    phone,
    id,
    customer,
    shipping_address,
  } = order;
  const { tracking_number, tracking_company } = fulfillments;

  return {
    id,
    customer_name: customer?.first_name ?? "guest",
    address: shipping_address?.address1 ?? "no address available",
    city: shipment?.city ?? "no city",
    country: shipment?.country ?? "no country",
    mobile: phone,
    amount: total_price,
    discount: total_discounts,
    quantity: line_items.length,
    sku: line_items.map((item) => item.sku),
    tracking_number,
    tracking_company,
  };
}

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

export const getCustomerDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { shop_name, accessToken } = req.shop;
    const axios = new ShopifyService({ shop_name, accessToken });
    const resp = await axios.get(`/customers/${id}.json`);
    const { customer } = resp.data;
    res.status(200).send({ customer });
  } catch (error) {
    res.status(500).send({ error: error.toString() });
  }
};

export const getOpenOrders = async (req, res) => {
  try {
    const { shop_name, accessToken } = req.shop;
    const axios = new ShopifyService({ shop_name, accessToken });
    const orders = await PaginatedList({
      service: axios,
      path: "orders.json",
      service_name: "orders",
      query: "status=open",
    });
    res.status(200).send({ orders: orders.map((order) => orderObject(order)) });
  } catch (error) {
    res.status(500).send({ error: error.toString() });
  }
};

export const getClosedOrders = async (req, res) => {
  try {
    const { shop_name, accessToken } = req.shop;
    const axios = new ShopifyService({ shop_name, accessToken });
    const orders = await PaginatedList({
      service: axios,
      path: "orders.json",
      service_name: "orders",
      query: "status=closed",
    });
    res.status(200).send({ orders: orders.map((order) => orderObject(order)) });
  } catch (error) {
    res.status(500).send({ error: error.toString() });
  }
};

export const getCancelledOrders = async (req, res) => {
  try {
    const { shop_name, accessToken } = req.shop;
    const axios = new ShopifyService({ shop_name, accessToken });
    const orders = await PaginatedList({
      service: axios,
      path: "orders.json",
      service_name: "orders",
      query: "status=cancelled",
    });
    res.status(200).send({ orders: orders.map((order) => orderObject(order)) });
  } catch (error) {
    res.status(500).send({ error: error.toString() });
  }
};

export const getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const { shop_name, accessToken } = req.shop;
    const axios = new ShopifyService({ shop_name, accessToken });
    const resp = await axios.get(`/orders/${id}.json`);
    const { order } = resp.data;

    res.status(200).send({ order: orderObject(order) });
  } catch (error) {
    res.status(500).send({ error: error.toString() });
  }
};

export const getDraftOrders = async (req, res) => {
  try {
    const { shop_name, accessToken } = req.shop;
    const axios = new ShopifyService({ shop_name, accessToken });
    const draft_orders = await PaginatedList({
      service: axios,
      path: "draft_orders.json",
      service_name: "draft_orders",
    });

    res
      .status(200)
      .send({ draft_orders: draft_orders.map((order) => orderObject(order)) });
  } catch (error) {
    res.status(500).send({ error: error.toString() });
  }
};

export const getDraftOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { shop_name, accessToken } = req.shop;
    const axios = new ShopifyService({ shop_name, accessToken });
    const resp = await axios.get(`/draft_orders/${id}.json`);
    const { draft_order } = resp.data;
    res.status(200).send({ draft_order: orderObject(draft_order) });
  } catch (error) {
    res.status(500).send({ error: error.toString() });
  }
};

export const getAbandonedCheckouts = async (req, res) => {
  try {
    const { shop_name, accessToken } = req.shop;
    const axios = new ShopifyService({ shop_name, accessToken });
    const checkouts = await PaginatedList({
      service: axios,
      path: "checkouts.json",
      service_name: "checkouts",
    });
    res.status(200).send({ checkouts });
  } catch (error) {
    res.status(500).send({ error: error.toString() });
  }
};
