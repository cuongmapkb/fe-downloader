const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const { Input } = require('enquirer');

const parseCoursePage = require('./parseCoursePage');
const downloadVideo = require('./downloadVideo');

const getDownloadPathFromUser = async () => {
    const locationPrompt = new Input({
        message: 'Enter download path',
    });

    return await locationPrompt.run();
};

const goToCourseDetailsPage = async (page, courseUrl) => {
    await page.goto('https://frontendmasters.com' + courseUrl, {
        timeout: 0,
        waitUntil: 'domcontentloaded'
    });

    await Promise.all([
        page.click('a.Button.ButtonRed'),
        page.waitForNavigation({
            waitUntil: 'domcontentloaded'
        })
    ]);

    await page.waitForSelector('.FMPlayerScrolling > li');
};

const downloadCourseVideos = async (page, courseChapters, downloadPath, courseTitle, delay) => {
    let videosCount = 0;
    const courseDirectoryPath = path.resolve(downloadPath, courseTitle); 
    const downloadDelay = delay * 60 * 1000;

    fse.ensureDirSync(courseDirectoryPath);

    for (let chapterTitle of Object.keys(courseChapters)) {
        const chapterVideos = courseChapters[chapterTitle];
        const chapterDirectoryPath = path.resolve(courseDirectoryPath, chapterTitle);
        fse.ensureDirSync(chapterDirectoryPath);

        for (let video of chapterVideos) {
            videosCount++;
            const videoFilePath = path.resolve(chapterDirectoryPath, `${videosCount}-${video.title}`);

            if (fs.existsSync(videoFilePath)) {
                console.log(`✔ You have already downloaded '${videosCount}-${video.title}'`.green);
                continue;
            }

            await page.click(`a[href="${video.href}"]`);
            await page.waitFor(downloadDelay);

            const url = await page.evaluate(() => {
                return document.querySelector('video').src
            });

            await downloadVideo(url, videoFilePath, `${videosCount}-${video.title}`);
        }
    }
};

const downloadCourse = async (page, courseTitle, courseUrl, delay) => {
    console.log(`✔ Downloading '${courseTitle}' course`.blue);
    const downloadPath = await getDownloadPathFromUser();

    await goToCourseDetailsPage(page, courseUrl);
    
    const coursePageHtml = await page.content();
    const courseVideos = parseCoursePage(coursePageHtml);

    await downloadCourseVideos(page, courseVideos, downloadPath, courseTitle, delay);
    console.log(`✔ Successfully downloaded '${courseTitle}'`.green);
};


module.exports = downloadCourse;