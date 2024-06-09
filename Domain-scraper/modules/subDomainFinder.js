const axios = require('axios');
const cheerio = require('cheerio');
const res = require('express/lib/response');
const getSubDomains = async (url, selector = "a" && ".link") => {
    try {
        // Fetch the HTML content of the web page
        const response = await axios.get(url);
        const html = response.data;

        // Load HTML into cheerio
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
        for (let i = 0; i < data.length; i += 2) {
            result.push({
                domain: data[i],
                ip: data[i + 1] || 'none'
            });
        }
        return result;
    } catch (error) {
        console.error('Error scraping data:', error);
        return null;
    }
}

module.exports = { getSubDomains };
