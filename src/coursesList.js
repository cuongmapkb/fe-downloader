const cheerio = require('cheerio');

const parseCoursesPage = async (page, html) => {
    const $ = cheerio.load(html);
    let isNotPremiumAccount = false;

    if ($('a[href="#free"]').length) {
        isNotPremiumAccount = true;
        console.log('✖ This account is not premium, you can only download free courses'.red);
        await page.goto('https://frontendmasters.com/courses#free', {
            timeout: 0,
            waitUntil: 'domcontentloaded'
        });
    }

    const courses = [];

    $(`.MediaList > li.MediaItem${ isNotPremiumAccount ? '.is-trial-course' : '' }`).each((index, element) => {
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
    return await parseCoursesPage(page, html);
};



module.exports = getCoursesList;