import express from "express";
import { validateWebhook } from "../middleware/index.js";
import { uninstallShopHandler, webhookHandler } from "../webhook/index.js";

export const webhookRoutes = new express.Router();

webhookRoutes.post("/uninstall-shop", validateWebhook, (req, res) => {
  uninstallShopHandler(req.body);
  console.log(`${req.shop_name} uninstalled the app`);
  res.status(200).send("OK");
});

webhookRoutes.post("/orders-cancelled", validateWebhook, (req, res) => {
  webhookHandler({
    path: "/orders-cancelled",
    body: req.body,
  });
  res.status(200).send("OK");
});

webhookRoutes.post("/orders-create", validateWebhook, (req, res) => {
  webhookHandler({
    path: "/orders-create",
    body: req.body,
  });
  res.status(200).send("OK");
});

webhookRoutes.post("/orders-fulfilled", validateWebhook, (req, res) => {
  webhookHandler({
    path: "/orders-fulfilled",
    body: req.body,
  });
  res.status(200).send("OK");
});

webhookRoutes.post("/orders-paid", validateWebhook, (req, res) => {
  webhookHandler({
    path: "/orders-paid",
    body: req.body,
  });
  res.status(200).send("OK");
});

webhookRoutes.post("/orders-updated", validateWebhook, (req, res) => {
  webhookHandler({
    path: "/orders-updated",
    body: req.body,
  });
  res.status(200).send("OK");
});

webhookRoutes.post("/customer-create", validateWebhook, (req, res) => {
  webhookHandler({
    path: "/customer-create",
    body: req.body,
  });
  res.status(200).send("OK");
});
