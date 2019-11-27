const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const { Input } = require('enquirer');

const parseCoursePage = require('./parseCoursePage');
const downloadVideo = require('./downloadVideo');
const downloadSubtitle = require('./downloadSubtitle');
const { subtitleSpy } = require('./requestInterceptor');
const { closeBrowser } = require('./browser');

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

const getVideoPlayerUrl = async (page) => {
    return await page.evaluate(() => {
        return document.querySelector('video').src
    });
}

const pauseVideoPlayer = async (page) => {
    await page.evaluate(() => {
        return document.querySelector('video').pause();        
    });
}

const downloadCourseVideos = async (page, courseChapters, downloadPath, courseTitle, delay, downloadSubtitles) => {
    let videosCount = 0;
    let lastVideoUrl;
    const courseDirectoryPath = path.resolve(downloadPath, courseTitle); 
    const downloadDelay = delay * 60 * 1000;

    fse.ensureDirSync(courseDirectoryPath);

    for (let chapterTitle of Object.keys(courseChapters)) {
        const chapterVideos = courseChapters[chapterTitle];
        const chapterDirectoryPath = path.resolve(courseDirectoryPath, chapterTitle);
        fse.ensureDirSync(chapterDirectoryPath);

        for (let video of chapterVideos) {
            videosCount++;
            //console.log('path video', video.title);
            let videoTitle = video.title;
            const characters = ['\\', '/', ':', '*', '?', '"', '<', '>', '|'];
            characters.forEach(el => {
            	videoTitle = videoTitle.replace(el, '');
            });
            //console.log('path video', videoTitle);
            const videoFilePath = path.resolve(chapterDirectoryPath, `${videosCount}-${videoTitle}`);

            if (fs.existsSync(videoFilePath)) {
                console.log(`✔ You have already downloaded '${videosCount}-${video.title}'`.green);
                continue;
            }

            lastVideoUrl = await getVideoPlayerUrl(page);
            await page.click(`a[href="${video.href}"]`);
            await page.waitFor(5000);
            await pauseVideoPlayer(page);
            await page.waitFor(downloadDelay);

            if (downloadSubtitles && subtitleSpy.hasMatch()) {
                const subtitles = subtitleSpy.getMatchedUrls();
                if (subtitles.length) {
                    try {
                        await downloadSubtitle(subtitles[subtitles.length - 1], `${videoFilePath}.srt`);
                    } catch(downloadSubtitleError) {}
                }
            }

            await page.waitForFunction((lastVideoUrl) => {
                return document.querySelector('video').src && document.querySelector('video').src !== lastVideoUrl
            });

            const url = await getVideoPlayerUrl(page);
            lastVideoUrl = url;
            await pauseVideoPlayer(page);

            await downloadVideo(url, videoFilePath, `${videosCount}-${videoTitle}`);
        }
    }
};

const setUpXHRErrorHandler = (page) => {
    page.on('response', async (response) => {
        if (response._status === 429) {
            console.error('429: You have reached maximum request limit');
            await closeBrowser();
            process.exit();
        }
    });
};

const downloadCourse = async (page, courseTitle, courseUrl, delay, downloadSubtitles) => {
    console.log(`✔ Downloading '${courseTitle}' course`.blue);
    const downloadPath = await getDownloadPathFromUser();
    setUpXHRErrorHandler(page);
    await goToCourseDetailsPage(page, courseUrl);
    
    const coursePageHtml = await page.content();
    const courseVideos = parseCoursePage(coursePageHtml);

    await downloadCourseVideos(page, courseVideos, downloadPath, courseTitle, delay, downloadSubtitles);
    console.log(`✔ Successfully downloaded '${courseTitle}'`.green);
};


module.exports = downloadCourse;