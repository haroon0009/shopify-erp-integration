import axios from "axios";

import { ENV_ERP_URL } from "../config/index.js";

const service = axios.create({
  baseURL: ENV_ERP_URL,
});

export const ERP_SERVICE = service;
