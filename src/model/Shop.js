import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { ENV_JWT_SECRET } from "../config/index.js";

const webHookSchema = new mongoose.Schema({
  address: { type: String },
  webhook_id: { type: Number },
  webhook_topic: { type: String },
});

const shopSchema = new mongoose.Schema(
  {
    shop_name: {
      type: String,
      required: true,
      trim: true,
    },
    accessToken: {
      type: String,
      trim: true,
    },
    scope: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      default: "active",
    },
    token: {
      type: String,
      trim: true,
    },
    webhooks: [webHookSchema],
  },
  {
    timestamps: true,
  }
);

shopSchema.methods.toJSON = function () {
  const shop = this;
  const shopObj = shop.toObject();
  delete shopObj.token;
  delete shopObj.webhooks;
  return shopObj;
};

shopSchema.methods.generateToken = async function () {
  const shop = this;
  const token = jwt.sign({ _id: shop._id.toString() }, ENV_JWT_SECRET);
  shop.token = token;
  await shop.save();
  return token;
};

shopSchema.methods.uninstallShop = async function () {
  const shop = this;
  shop.status = "uninstalled";
  shop.token = "";
  shop.webhooks = [];
  await shop.save();
  return shop;
};

shopSchema.statics.addOrUpdateShop = async function ({
  shop,
  accessToken,
  scope,
}) {
  const ShopModal = this;
  const shopExist = await ShopModal.findOne({ shop_name: shop });
  if (!shopExist) {
    let newShop = new ShopModal({ shop_name: shop, accessToken, scope });
    await newShop.save();
    await newShop.generateToken();
    return newShop;
  }
  shopExist.accessToken = accessToken;
  shopExist.scope = scope;
  await shopExist.save();
  return shopExist;
};

export const ShopModal = mongoose.model("Shop", shopSchema);
