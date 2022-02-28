import cron from "node-cron";
import { ShopModal } from "../model/index.js";
import { ERP_SERVICE, ShopifyService } from "../service/index.js";
import { ENV_SHOP } from "../config/index.js";

// cron job will run after 12am every day
cron.schedule("0 0 * * *", async () => {
  console.log("CRON JOB STARTED");
  try {
    const shop = await ShopModal.findOne({ shop_name: ENV_SHOP });
    if (!shop) return;

    const products = await fetchProducts();
    if (!products) {
      console.log(new Date());
      console.log("NO PRODUCTS FOUND");
      return;
    }

    const { accessToken, shop_name } = shop;
    const axios = new ShopifyService({ accessToken, shop_name });

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const resp = await axios.post("/products.json", { product });
      console.log("product uploaded", resp.data.product);
    }
  } catch (error) {
    console.log(error?.response?.data ?? error);
  }
});

async function fetchProducts() {
  try {
    const resp = await ERP_SERVICE.get("/getallproducts");
    const erp_products = resp.data;

    const uniqueProducts = erp_products.reduce((acc, current) => {
      const { ProductName } = current;
      const index = acc.findIndex((p) => p.ProductName === ProductName);
      if (index == -1) {
        return [...acc, current];
      }
      return acc;
    }, []);

    const products = uniqueProducts.map((product) => {
      const { ProductName } = product;
      let sizes = ["STND", "S", "M", "L", "XL", "XXL"];
      let colors = [];
      const variants = [];
      const options = [];

      // option1 will always be the size
      // option2 will always be the color
      const allProds = erp_products.filter(
        (p) => p.ProductName === ProductName
      );

      allProds.forEach((p) => {
        const { Size, Color, BarCode, SKU } = p;
        // if (Size) sizes.push(Size.trim());
        if (Color && Color !== ".") colors.push(Color);

        //   TODO:: prices and stocks are missing
        variants.push({
          option1: Size?.trim() ?? "",
          option2: Color?.trim() ?? "",
          sku: SKU?.trim() ?? "",
          barcode: BarCode?.trim() ?? "",
          price: "--",
          inventory_quantity: "--",
        });
      });

      options.push({ name: "Size", values: [...new Set(sizes)] });
      options.push({ name: "Color", values: [...new Set(colors)] });

      return {
        title: ProductName.trim(),
        vendor: "lala textile",
        product_type: "cloths",
        status: "draft",
        options,
        variants,
      };
    });

    return products;
  } catch (error) {
    console.log(error?.response?.data ?? error);
    return false;
  }
}
