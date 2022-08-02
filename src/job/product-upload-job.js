import cron from 'node-cron';
import { ShopModal, ErrorMessage, FulFillmentModal } from '../model/index.js';
import { ERP_SERVICE, ShopifyService } from '../service/index.js';
import { ENV_SHOP, ENV_BRAND_GROUP } from '../config/index.js';

// cron job will run after 12am every day
cron.schedule('0 0 * * *', async () => {
  console.log(new Date(), '  ==>>CRON JOB STARTED');
  const shop = await ShopModal.findOne({ shop_name: ENV_SHOP });
  if (!shop) return;

  const products = await fetchProducts();
  if (!products) return;

  const { accessToken, shop_name } = shop;
  const axios = new ShopifyService({ accessToken, shop_name });

  for (let i = 0; i < products.length; i++) {
    try {
      const product = products[i];
      const resp = await axios.post('/products.json', { product });
      const prod = resp.data.product;
      const full = new FulFillmentModal({
        type: 'product',
        path: 'uploading error',
        meta_details: prod,
      });
      await full.save();
    } catch (error) {
      const msg = new ErrorMessage({
        type: `${shop_name}`,
        meta_details: error,
      });
      await msg.save();
      console.log(error?.response?.data ?? error);
    }
  }
});

async function fetchProducts() {
  try {
    const resp = await ERP_SERVICE.get('/Products');
    const erp_products = resp.data;

    const uniqueProducts = erp_products
      .reduce((acc, current) => {
        const { ProductName } = current;
        const index = acc.findIndex((p) => p.ProductName === ProductName);
        if (index == -1) {
          return [...acc, current];
        }
        return acc;
      }, [])
      .filter((prod) => prod.Status === 'NEW');

    const products = uniqueProducts
      .map((product) => {
        const { ProductName, BrandGroup } = product;
        let sizes = ['STND', 'S', 'M', 'L', 'XL', 'XXL'];
        let colors = [];
        const variants = [];
        const options = [];

        // option1 will always be the size
        // option2 will always be the color
        const allProds = erp_products.filter(
          (p) => p.ProductName === ProductName
        );

        allProds.forEach((p) => {
          const { Size, Color, BarCode, SKU, SaleRate, Quantity } = p;
          // if (Size) sizes.push(Size.trim());
          if (Color && Color !== '.') colors.push(Color);

          variants.push({
            option1: Size?.trim() ?? '',
            option2: Color?.trim() ?? '',
            sku: SKU?.trim() ?? '',
            barcode: BarCode?.trim() ?? '',
            price: String(SaleRate) || '00',
            inventory_quantity: Quantity?.trim() ?? 0,
          });
        });

        options.push({ name: 'Size', values: [...new Set(sizes)] });
        options.push({ name: 'Color', values: [...new Set(colors)] });

        // ENV_BRAND_GROUP

        return {
          title: ProductName?.trim(),
          vendor: BrandGroup?.trim() ?? 'lala',
          product_type: 'cloths',
          status: 'draft',
          options,
          variants,
        };
      })
      .filter((prod) => {
        return prod.vendor === ENV_BRAND_GROUP;
      });

    return products;
  } catch (error) {
    const msg = new ErrorMessage({
      type: `error while fetchProducts`,
      meta_details: error,
    });
    await msg.save();
    console.log(error?.response?.data ?? error);
    return false;
  }
}
