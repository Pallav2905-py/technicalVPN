const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function getPageSource(url) {
    try {

        // Launch the browser
        const browser = await puppeteer.launch();
        // Open a new page
        const page = await browser.newPage();
        // Navigate to the desired website
        await page.goto(url, { waitUntil: 'networkidle2' });
        // Get the page content (HTML source)
        const pageSource = await page.content();

        // Close the browser
        await browser.close();

        return pageSource
    } catch (error) {
        return null;
    }
}

async function getTransactions(url) {
    selector1 = 'a' && '.link--underlined'
    selector2 = ".caption" && ".fs-sm"
    timeSelector = ".color-text-secondary" && "time"
    balSelector = ".wb-bw" && "span"
    try {
        // Lading the pageSource into cheerio
        const html = await getPageSource(url)
        // Checking if the html is null or not
        if (html != null) {
            const $ = cheerio.load(html);
            // Select elements using the provided selector
            const elements = $(selector1);
            const elements2 = $(selector2);
            const timeData = $(timeSelector);
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
            const result = [];
            for (let i = 2; i < data.length; i++) {
                result.push({
                    Transaction: data[i],
                    Confirmation: confirmations[i],
                    Time: time[i],
                });
            }
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

//     const data = await getTransactions(url);
//     console.log(data);
// }
// main()
module.exports = {getTransactions}