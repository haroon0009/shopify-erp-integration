import { createServer } from 'http';
import express from 'express';
import ShopifyApi from '@shopify/shopify-api';
import cors from 'cors';
import helmet from 'helmet';

import routes from './router/index.js';
import { webhookRoutes } from './router/webhook-routes.js';
import { registerWebhooks } from './webhook/index.js';
import { ShopModal } from './model/index.js';
import {
  ENV_SHOPIFY_API_KEY,
  ENV_SHOPIFY_API_SECRET,
  ENV_SCOPES,
  ENV_HOST,
  ENV_PORT,
  API_VERSION,
  ENV_ERP_URL,
} from './config/index.js';

import './db/index.js';
import './job/product-upload-job.js';

const app = express();
const Shopify = ShopifyApi.default;

Shopify.Context.initialize({
  API_KEY: ENV_SHOPIFY_API_KEY,
  API_SECRET_KEY: ENV_SHOPIFY_API_SECRET,
  SCOPES: ENV_SCOPES.split(','),
  HOST_NAME: ENV_HOST.replace(/https:\/\//, ''),
  API_VERSION: API_VERSION,
  IS_EMBEDDED_APP: false,
});

app.set('view engine', 'ejs');
app.use(cors());

app.get('/', async function (req, res) {
  const shop = req.query.shop;
  if (!shop) return res.render('pages/error');

  const shopExist = await ShopModal.findOne({ shop_name: shop });
  if (!shopExist) {
    res.redirect(`/login?shop=${shop}`);
  } else {
    const webhookDocs =
      'https://shopify.dev/api/admin-rest/2022-01/resources/webhook#top';
    let webhookEndPoints = [
      {
        path: '/webhook/orders-cancelled',
        doc_link: webhookDocs,
        request_type: 'POST',
      },
      {
        path: '/webhook/orders-create',
        doc_link: webhookDocs,
        request_type: 'POST',
      },
      {
        path: '/OrdersFulfill',
        doc_link: webhookDocs,
        request_type: 'POST',
      },
      {
        path: '/webhook/orders-updated',
        doc_link: webhookDocs,
        request_type: 'POST',
      },
    ];

    let apiEndPoints = [
      {
        path: '/api/customers',
        doc_link:
          'https://shopify.dev/api/admin-rest/2022-01/resources/customer#get-customers',
        request_type: 'GET',
      },
      {
        path: '/api/customer/:id',
        doc_link:
          'https://shopify.dev/api/admin-rest/2022-01/resources/customer#get-customers-customer-id',
        request_type: 'GET',
      },
      {
        path: '/api/orders/open',
        doc_link:
          'https://shopify.dev/api/admin-rest/2022-01/resources/order#get-orders?status=any',
        request_type: 'GET',
      },
      {
        path: '/api/orders/closed',
        doc_link:
          'https://shopify.dev/api/admin-rest/2022-01/resources/order#get-orders?status=any',
        request_type: 'GET',
      },
      {
        path: '/api/orders/cancelled',
        doc_link:
          'https://shopify.dev/api/admin-rest/2022-01/resources/order#get-orders?status=any',
        request_type: 'GET',
      },
      {
        path: '/api/order/:id',
        doc_link:
          'https://shopify.dev/api/admin-rest/2022-01/resources/order#get-orders-order-id',
        request_type: 'GET',
      },
      {
        path: '/api/draft-orders',
        doc_link:
          'https://shopify.dev/api/admin-rest/2022-01/resources/draftorder#get-draft-orders',
        request_type: 'GET',
      },
      {
        path: '/api/draft-order/:id',
        doc_link:
          'https://shopify.dev/api/admin-rest/2022-01/resources/draftorder#get-draft-orders-draft-order-id',
        request_type: 'GET',
      },
      {
        path: '/api/abandoned-checkouts',
        doc_link:
          'https://shopify.dev/api/admin-rest/2022-01/resources/abandoned-checkouts#get-checkouts?limit=1',
        request_type: 'GET',
      },
    ];

    apiEndPoints = apiEndPoints.map((doc) => {
      return {
        ...doc,
        path: `${ENV_HOST}${doc.path}`,
      };
    });

    webhookEndPoints = webhookEndPoints.map((doc) => {
      return {
        ...doc,
        path: `${ENV_ERP_URL}${doc.path}`,
      };
    });

    res.render('pages/index', {
      shop: shopExist,
      api_end_points: apiEndPoints,
      webhooks: webhookEndPoints,
    });
  }
});

app.get('/login', async (req, res) => {
  const shop_name = req.query.shop;
  if (!shop_name) return res.render('pages/error');
  const isOnline = false;
  let authRoute = await Shopify.Auth.beginAuth(
    req,
    res,
    shop_name,
    '/auth/callback',
    isOnline
  );
  return res.redirect(authRoute);
});

app.get('/auth/callback', async (req, res) => {
  try {
    const shop_name = req.query.shop;
    if (!shop_name) return res.render('pages/error');
    const session = await Shopify.Auth.validateAuthCallback(
      req,
      res,
      req.query
    );
    const { scope, accessToken } = session;

    await registerWebhooks(session);

    await ShopModal.addOrUpdateShop({
      shop: shop_name,
      scope,
      accessToken,
    });
    // save the access token in the db.
    res.redirect(`/?shop=${shop_name}`);
  } catch (error) {
    console.log(error);
  }
});

app.get('/404', (req, res) => {
  res.render('pages/404');
});

app.use(helmet());
app.use(cors());
app.use('/webhook', webhookRoutes);
app.use(express.json());
app.use('/api', routes);

/** catch 404*/
app.use('*', (req, res) => {
  res.redirect('/404');
});

const PORT = ENV_PORT || '3000';
const httpServer = createServer(app);

// global error handler
// app.use(globalErrorHandler);
httpServer.listen(PORT, () => console.log(`APP RUNNING ON PORT: ${PORT}`));

process.on('uncaughtException', (err) => console.error(err, err.stack));
process.on('unhandledRejection', (err) => console.error(err, err.stack));
