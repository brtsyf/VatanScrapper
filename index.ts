import { ProductType } from "./types/ProductType";
var express = require("express");
var puppeteer = require("puppeteer");
var app = express();

app.get("/vatan/:productName", async (req: Request, res: Response) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let currentPage: number = 1;
  let list: string[] = [];
  let baseUrl: URL = new URL(
    "https://www.vatanbilgisayar.com/cep-telefonu-modelleri/"
  );

  const goNextPage = async (pageNumber: number) => {
    try {
      await page.goto(`${baseUrl}?page=${pageNumber}`);
      await page.setViewport({ width: 1000, height: 700 });
      getProductVatan();
    } catch (e) {
      console.log("Sayfa Değiştirilirken bir sorunla karşılaşıldı");
    }
  };

  const searchProductVatan = async (name: string) => {
    console.log("Search Item :", name);
    try {
      await page.goto(`https://www.vatanbilgisayar.com/`);
      await page.setViewport({ width: 1000, height: 700 });

      await page.locator(".search__input").fill(name);
      await page.click(".search__button");
      baseUrl = await page.url();
      goNextPage(currentPage);
    } catch (e) {
      console.log("Search Yaparken Bir sorunla karşılaşıldı");
    }
  };

  const getProductVatan = async () => {
    console.log("Scrapper is working");
    try {
      const scrapProducts = await page.evaluate((): ProductType[] => {
        const productBox = document.querySelectorAll(
          ".product-list--list-page .product-list__product-name h3"
        );
        const productImageBox = document.querySelectorAll(".product-list-link");
        const productPriceBox = document.querySelectorAll(
          ".product-list__price"
        );
        let products: ProductType[] = [];
        productBox.forEach((product, index) => {
          products.push({
            productName: product?.innerHTML.trim() || null,
            productPrice:
              Number(productPriceBox[index]?.innerHTML.trim()) || null,
            productLink: `${productImageBox[index]}` || null,
          });
        });
        return products;
      });
      if (scrapProducts.length > 0) {
        scrapProducts.forEach((product: string) => {
          list.push(product);
        });
        currentPage += 1;
        goNextPage(currentPage);
        // console.log(currentPage);
      } else {
        if (list.length > 0) {
          console.log(list.length);
          res.json({ SearchProductOutput: list });
          console.log("Scrapper is Finished");
        } else {
          res.json({ status: "Not Found" });
          console.log("Scrapper is Finished");
        }
        await browser.close();
      }
    } catch (e) {
      console.log("Scrapper is not working");
    }
  };

  searchProductVatan(req.params.productName);
});

app.listen("8080", () => {
  console.log("Server is running on port 8080");
});
