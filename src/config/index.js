import dotenv from 'dotenv';
dotenv.config();

import { ApiVersion } from '@shopify/shopify-api';

export const API_VERSION = ApiVersion.October21;
export const API_PREFIX = '/api/v1/';
export const SHOPIFY_API_DELAY = 150;

// environment variables
const {
  SHOPIFY_API_KEY,
  SHOPIFY_API_SECRET,
  SCOPES,
  JWT_SECRET,
  DATABASE_CONNECTION,
  HOST,
  NODE_ENV,
  IS_PRIVATE,
  PORT,
  ERP_URL,
  SHOP,
  BRAND_GROUP,
} = process.env;

export const ENV_SHOPIFY_API_KEY = SHOPIFY_API_KEY;
export const ENV_SHOPIFY_API_SECRET = SHOPIFY_API_SECRET;
export const ENV_SCOPES = SCOPES;
export const ENV_JWT_SECRET = JWT_SECRET;
export const ENV_DATABASE_CONNECTION = DATABASE_CONNECTION;
export const ENV_HOST = HOST;
export const ENV_NODE_ENV = NODE_ENV;
export const ENV_IS_PRIVATE = IS_PRIVATE;
export const ENV_PORT = PORT;
export const ENV_ERP_URL = ERP_URL;
export const ENV_SHOP = SHOP;
export const ENV_BRAND_GROUP = BRAND_GROUP;
