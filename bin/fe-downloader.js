const {
    AutoComplete,
} = require('enquirer');
const colors = require('colors');

const {
    openBrowser,
    openPage,
    closeBrowser
} = require('./browser');
const login = require('./login');
const getCoursesList = require('./coursesList');
const downloadCourse = require('./downloadCourse');


module.exports = async ({ delay }) => {
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

      await downloadCourse(page, selectedCourseTitle, coursePageUrl, delay);
    } catch(err) {
        console.err(err);
        process.exit();
    }

    await closeBrowser();
    process.exit();
};