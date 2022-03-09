import express from "express";
import { authMiddleware } from "../middleware/index.js";
import { ERP_SERVICE } from "../service/index.js";

import {
  getAllCustomers,
  getCustomerDetails,
  getOrderDetail,
  getCancelledOrders,
  getClosedOrders,
  getOpenOrders,
  getDraftOrders,
  getDraftOrderDetails,
  getAbandonedCheckouts,
  getCancelledAny,
} from "../controllers/index.js";

const router = new express.Router();

router.get("/customers", authMiddleware, getAllCustomers);
router.get("/customer/:id", authMiddleware, getCustomerDetails);

router.get("/orders/open", authMiddleware, getOpenOrders);
router.get("/orders/closed", authMiddleware, getClosedOrders);
router.get("/orders/cancelled", authMiddleware, getCancelledOrders);
router.get("/orders/any", authMiddleware, getCancelledAny);

router.get("/order/:id", authMiddleware, getOrderDetail);

router.get("/draft-orders", authMiddleware, getDraftOrders);
router.get("/draft-order/:id", authMiddleware, getDraftOrderDetails);

router.get("/abandoned-checkouts", authMiddleware, getAbandonedCheckouts);

router.get("/test", async (req, res) => {
  try {
    const resp = await ERP_SERVICE.get("/Products");
    const products = resp.data;
    res.status(200).send({
      success: true,
      message: "Node App working Fine.",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.toString() });
  }
});

export default router;
