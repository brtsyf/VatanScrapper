var express = require("express");
var puppeteer = require("puppeteer");
var app = express();

interface ProductType {
  name: string | null;
  price: string | null;
  link: string | null;
}

app.get("/vatan/:productName", async (req: Request, res: Response) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let nowPage: number = 1;
  let list: string[] = [];
  let url: URL = new URL(
    "https://www.vatanbilgisayar.com/cep-telefonu-modelleri/"
  );

  const goNextPage = async (pageNumber: number) => {
    try {
      await page.goto(`${url}?page=${pageNumber}`);
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
      url = await page.url();
      goNextPage(1);
    } catch (e) {
      console.log("Search Yaparken Bir sorunla karşılaşıldı");
    }
  };

  const getProductVatan = async () => {
    console.log("Scrapper is working");
    try {
      const scrapProducts = await page.evaluate(() => {
        const productBox = document.querySelectorAll(
          ".product-list--list-page .product-list__product-name h3"
        );
        const ProductImageBox = document.querySelectorAll(
          ".product-list__image-safe a"
        );
        const ProductPriceBox = document.querySelectorAll(
          ".product-list__price"
        );
        let products: ProductType[] = [];
        productBox.forEach((product, index) => {
          products.push({
            name: product?.innerHTML || null,
            price: ProductPriceBox[index]?.innerHTML + " TL" || null,
            link: `${ProductImageBox[index]}` || null,
          });
        });
        return products;
      });
      if (scrapProducts.length > 0) {
        scrapProducts.forEach((product: string) => {
          list.push(product);
        });
        nowPage += 1;
        goNextPage(nowPage);
        // console.log(nowPage);
      } else {
        if (list.length > 0) {
          console.log(list.length);
          res.json({ products: list });
          console.log("Scrapper is Finished");
        } else {
          res.json({ ok: "Not Found" });
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
