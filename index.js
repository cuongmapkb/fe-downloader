require('dotenv').config();
const {
    AutoComplete,
} = require('enquirer');
const colors = require('colors');

const {
    openBrowser,
    openPage,
    closeBrowser
} = require('./src/browser');
const login = require('./src/login');
const getCoursesList = require('./src/coursesList');
const downloadCourse = require('./src/downloadCourse');

(async () => {
    try {
      await openBrowser();

      const page = await openPage();
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
      const coursePageUrl = courses.find(c => c.title === selectedCourseTitle).url;

      await downloadCourse(page, selectedCourseTitle, coursePageUrl);
    } catch(err) {}

    await closeBrowser();
    process.exit();
})();