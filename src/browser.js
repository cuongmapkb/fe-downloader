const puppeteer = require('puppeteer');

module.exports = (async () => {
    const browser = await puppeteer.launch({ headless: false });
    let pages = [];

    const createPage = async (options) => {
        const newPage = await browser.newPage(options);
        pages.push(newPage);

        return newPage;
    };

    const closeBrowser = async () => {
        for (let page of pages) {
            await page.close();
        }

        await browser.close();
    }


    return {
        closeBrowser,
        createPage,
        closeBrowser
    }
})();