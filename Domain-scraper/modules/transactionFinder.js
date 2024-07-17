const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios')
require("dotenv").config()

async function getPageSource(url) {
  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });
  try {

    // Launch the browser
    // const browser = await puppeteer.launch({ headless: true });
    // Open a new page
    const page = await browser.newPage();
    // Navigate to the desired website
    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.waitForSelector('body');

    // Get the page content (HTML source)
    const pageSource = await page.content();

    // Close the browser
    await browser.close();

    return pageSource
  } catch (error) {
    return null;
  }
  finally {
    await browser.close();

  }
}

async function getTransactions(url) {
  selector1 = 'a' && '.link--underlined'
  selector2 = ".caption" && ".fs-sm"
  timeSelector = ".color-text-secondary" && "time"
  balSelector = "span.wb-bw"
  try {
    // Lading the pageSource into cheerio
    // const finalUrl = await getPageSource(url);

    const html = await getPageSource(url)
    // Checking if the html is null or not
    if (html != null) {
      const $ = cheerio.load(html);
      // Select elements using the provided selector
      const elements = $(selector1);
      const elements2 = $(selector2);
      const timeData = $(timeSelector);
      const balData = $(balSelector);
      // Extract data from elements
      const data = [];
      elements.each((index, element) => {
        data.push($(element).text().trim());
      });
      const confirmations = []
      elements2.each((index, element2) => {
        confirmations.push($(element2).text().trim());
      });
      const time = []
      timeData.each((index, timeData) => {
        time.push($(timeData).text().trim());
      });
      const balance = []
      const bal = []
      balData.each((index, balData) => {
      bal.push($(balData).text().trim().replace(/\s+/g, ""));
        // if (!(balData.endsWith("TRX"))) {
        //   balance.push(balData)
        // }
      });

      console.log(balance)

      confirmations.splice(0, 2);

      var accountBal = bal[0];
      var accountBalInUSD = bal[1];

      const result = { Transaction: [], Amounts: [], accountBal: null, accountBalInUSD: null };
      for (let i = 0; i < data.length; i++) {
        result.Transaction.push({
          Transaction: data[i],
          Confirmation: confirmations[i],
          Time: time[i],

        });
      }
      for (let i = 0; i < balData.length; i++) {
        result.Amounts.push(bal[i]);
      }
      result.accountBal = accountBal;
      result.accountBalInUSD = accountBalInUSD;

      return result;
    }
    else {
      return null;
    }

  } catch (error) {
    console.error('Error scraping data:', error);
    return null;
  }

}
// const url = "https://blockchair.com/search?q=TXk363ThKzQXQzPC1QQezkLgr3QajApArX"
// async function main(params) {

//   const data = await getTransactions(url);
//   console.log(data);
// }
// main()
module.exports = { getTransactions }