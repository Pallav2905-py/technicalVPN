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

async function getTransactions(url, selector = 'a' && '.link--underlined') {
    try {
        // Lading the pageSource into cheerio
        const html = await getPageSource(url)
        // Checking if the html is null or not
        if (html != null) {
            const $ = cheerio.load(html);
            // Select elements using the provided selector
            const elements = $(selector);
            // Extract data from elements
            const data = [];
            elements.each((index, element) => {
                data.push($(element).text().trim());
                // console.log(index)
            });

            const result = [];
            for (let i = 2; i < data.length; i++) {
                result.push({
                    Transaction: data[i],
                });
            }
            return result;
        }
        else{
            return null;
        }

    } catch (error) {
        console.error('Error scraping data:', error);
        return null;
    }

}

module.exports = {getTransactions}