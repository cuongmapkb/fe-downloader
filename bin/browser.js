const puppeteer = require('puppeteer');

let browser;
let pages = [];

const openBrowser = async () => {
    browser = await puppeteer.launch({ headless: false });
};

const openPage = async () => {
    const newPage = await browser.newPage();
    await newPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36');
    pages.push(newPage);

    return newPage;
};

const closeBrowser = async () => {
    for (let page of pages) {
        await page.close();
    }

    await browser.close();
};

module.exports = {
    openBrowser,
    closeBrowser,
    openPage
};