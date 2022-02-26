import jwt from "jsonwebtoken";
import { ShopModal } from "../model/index.js";
import { handleError } from "../lib/handle-errors.js";
import { ENV_JWT_SECRET } from "../config/index.js";

export const authMiddleware = async (req, res, next) => {
  try {
    if (!req.header("Authorization")) throw new Error("You are not authorize.");
    const token = req.header("Authorization").replace("Bearer ", "");
    const { _id } = jwt.verify(token, ENV_JWT_SECRET);
    const shop = await ShopModal.findOne({
      _id,
      token: token,
    });
    if (!shop) throw new Error("You are not authorize.");
    if (shop && shop.status === "uninstalled")
      throw new Error("You are not authorize.");

    req.token = token;
    req.shop = shop;
    next();
  } catch (error) {
    handleError(res, error);
  }
};
