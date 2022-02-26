import express from "express";
import { authMiddleware } from "../middleware/index.js";
import { getAllCustomers } from "../controllers/index.js";

const router = new express.Router();

router.get("/customers", authMiddleware, getAllCustomers);

export default router;
