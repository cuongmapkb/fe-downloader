const cheerio = require('cheerio');

const parseCoursePage = (html) => {
    const $ = cheerio.load(html);
    const listItems = $('.FMPlayerScrolling > li');
    const course = {};
    let groups = 0;
    let lastGroup;


    listItems.each((index, element) => {
        const $element = $(element);
        
        if ($element.hasClass('lesson-group')) {
            groups++;
            course[groups + '-' + $element.text()] = [];
            lastGroup = groups + '-' + $element.text();
        } else {
            course[lastGroup].push({
                title: $element.find('.title').text().trim(),
                href: $element.find('a.lesson').attr('href')
            });
        }
    });

    return course;
};


module.exports = parseCoursePage;