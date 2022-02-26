import express from "express";
import { authMiddleware } from "../middleware/index.js";
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
} from "../controllers/index.js";

const router = new express.Router();

router.get("/customers", authMiddleware, getAllCustomers);
router.get("/customer/:id", authMiddleware, getCustomerDetails);

router.get("/orders/open", authMiddleware, getOpenOrders);
router.get("/orders/closed", authMiddleware, getClosedOrders);
router.get("/orders/cancelled", authMiddleware, getCancelledOrders);
router.get("/order/:id", authMiddleware, getOrderDetail);

router.get("/draft-orders", authMiddleware, getDraftOrders);
router.get("/draft-order/:id", authMiddleware, getDraftOrderDetails);

router.get("/abandoned-checkouts", authMiddleware, getAbandonedCheckouts);

router.get("/test", (req, res) => {
  res.status(200).send({
    success: true,
    message: "Node App working Fine.",
  });
});

export default router;
