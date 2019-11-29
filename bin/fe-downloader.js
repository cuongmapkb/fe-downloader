const {
    AutoComplete,
} = require('enquirer');
const colors = require('colors');

const {
    lunchBrowser,
    openPage,
    closeBrowser
} = require('./browser');
const login = require('./login');
const getCoursesList = require('./coursesList');
const downloadCourse = require('./downloadCourse');
const { requestInterceptor } = require('./requestInterceptor');

RegExp.escape = function(s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

module.exports = async ({ delay, openBrowser, downloadSubtitles }) => {
    try {
      await lunchBrowser(openBrowser);

      const page = await openPage();
      page.on('request', requestInterceptor.intercept.bind(requestInterceptor));

      await login(page);

      console.log('✔ Successfully logged in'.green);
      console.log('✔ Fetching courses list...'.yellow);


      const courses = await getCoursesList(page);

      const selectCoursePrompt = new AutoComplete({
          name: 'Course to download',
          message: 'Select course to download',
          limit: 10,
          choices: courses.map(course => course.title)
      });

      const selectedCourseTitle = await selectCoursePrompt.run();
    //   console.log('Chon course title', selectedCourseTitle);
      let CourseName = selectedCourseTitle;
      const characters = ['\\', '/', ':', '*', '?', '"', '<', '>', '|'];
      characters.forEach(el => {
        CourseName = CourseName.replace(new RegExp(RegExp.escape(el), 'g'), '');
      });
      const coursePageUrl = courses.find(c => c.title === selectedCourseTitle).url;

      await downloadCourse(page, CourseName, coursePageUrl, delay, downloadSubtitles);
    } catch(err) {
        console.error(err);
        process.exit();
    }

    await closeBrowser();
    process.exit();
};