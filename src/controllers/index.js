import PaginatedList from "../lib/paginated-list.js";
import { ShopifyService } from "../service/shopify-service.js";

export async function fetchVariant(axios, id) {
  const resp = await axios.get(`/variants/${id}.json`);
  return resp.data.variant;
}

export async function orderObject(order, axios) {
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
    current_total_tax,
    fulfillment_status,
  } = order;
  let tracking_number;
  let tracking_company;

  if (fulfillments && fulfillments.length) {
    tracking_number = fulfillments[0].tracking_number;
    tracking_company = fulfillments[0].tracking_company;
  }

  const products = [];

  for (let i = 0; i < line_items.length; i++) {
    const { product_id, variant_id, quantity, total_discount, price } =
      line_items[i];
    const variant = await fetchVariant(axios, variant_id);
    const { barcode, sku } = variant;
    products.push({
      product_id,
      variant_id,
      price,
      // discount:total_discount,
      quantity,
      barcode,
      sku,
    });
  }

  return {
    id,
    email: customer?.email ?? contact_email,
    customer_name: customer?.first_name ?? "guest",
    address: shipping_address?.address1 ?? "no address available",
    city: shipping_address?.city ?? "no city",
    country: shipping_address?.country ?? "no country",
    mobile: phone,
    discount: total_discounts,
    total_tax: current_total_tax,
    amount: total_price,
    tracking_number: tracking_number || "",
    tracking_company: tracking_company || "",
    products,
    status: fulfillment_status,
  };
}

function draftOrderObj(obj) {
  const {
    id,
    customer,
    shipping_address,
    total_price,
    applied_discount,
    line_items,
  } = obj;

  return {
    id,
    email: customer?.email ?? "",
    mobile: customer?.phone ?? "",
    customer_name: customer?.first_name ?? "",
    address: shipping_address?.address1 ?? "",
    city: shipping_address?.city ?? "",
    country: shipping_address?.country ?? "",
    amount: total_price,
    discount: applied_discount?.amount ?? 0,
    products: line_items.map((prod) => {
      const { barcode, sku, price, quantity, product_id, variant_id } = prod;
      return {
        barcode: barcode,
        sku,
        price,
        quantity,
        product_id,
        variant_id,
      };
    }),
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
    const ordersList = await PaginatedList({
      service: axios,
      path: "orders.json",
      service_name: "orders",
      query: "status=open",
    });
    const orders = [];
    for (let i = 0; i < ordersList.length; i++) {
      const order = await orderObject(ordersList[i], axios);
      orders.push(order);
    }
    res.status(200).send({ orders });
  } catch (error) {
    res.status(500).send({ error: error.toString() });
  }
};

export const getClosedOrders = async (req, res) => {
  try {
    const { shop_name, accessToken } = req.shop;
    const axios = new ShopifyService({ shop_name, accessToken });
    const ordersList = await PaginatedList({
      service: axios,
      path: "orders.json",
      service_name: "orders",
      query: "status=closed",
    });
    const orders = [];
    for (let i = 0; i < ordersList.length; i++) {
      const order = await orderObject(ordersList[i], axios);
      orders.push(order);
    }
    res.status(200).send({ orders });
  } catch (error) {
    res.status(500).send({ error: error.toString() });
  }
};

export const getCancelledOrders = async (req, res) => {
  try {
    const { shop_name, accessToken } = req.shop;
    const axios = new ShopifyService({ shop_name, accessToken });
    const ordersList = await PaginatedList({
      service: axios,
      path: "orders.json",
      service_name: "orders",
      query: "status=cancelled",
    });
    const orders = [];
    for (let i = 0; i < ordersList.length; i++) {
      const order = await orderObject(ordersList[i], axios);
      orders.push(order);
    }
    res.status(200).send({ orders });
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
    const orderObj = resp.data.order;
    const order = await orderObject(orderObj, axios);
    res.status(200).send({ order });
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

    res.status(200).send({
      draft_orders: draft_orders.map((order) => draftOrderObj(order)),
    });
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
    res.status(200).send({ draft_order: draftOrderObj(draft_order) });
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

export const getCancelledAny = async (req, res) => {
  try {
    const { shop_name, accessToken } = req.shop;
    const axios = new ShopifyService({ shop_name, accessToken });
    const ordersList = await PaginatedList({
      service: axios,
      path: "orders.json",
      service_name: "orders",
      query: "status=any",
    });
    const orders = [];
    for (let i = 0; i < ordersList.length; i++) {
      const order = await orderObject(ordersList[i], axios);
      orders.push(order);
    }
    res.status(200).send({ orders });
  } catch (error) {
    res.status(500).send({ error: error.toString() });
  }
};
