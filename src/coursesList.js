const {
    closeBrowser
} = require('./browser');
const cheerio = require('cheerio');

const parseCoursesPage = async (html) => {
    const $ = cheerio.load(html);

    if ($('a[href="#free"]').length) {
        console.log('✖ This account is not premium, try another account'.red);
        await closeBrowser();
        process.exit();
    }

    const courses = [];

    $('.MediaList > li.MediaItem').each((index, element) => {
        courses.push({
            title: $(element).find('.title a').text(),
            url: $(element).find('.title a').attr('href')
        });
    });


    return courses;
};


const getCoursesList = async (page) => {
    await page.goto('https://frontendmasters.com/courses/', {
        timeout: 0,
        waitUntil: 'domcontentloaded'
    });
    await page.waitForSelector('.MediaList > li.MediaItem');
    const html = await page.content();
    return await parseCoursesPage(html);
};



module.exports = getCoursesList;