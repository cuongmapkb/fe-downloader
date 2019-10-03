const puppeteer = require('puppeteer');
const jsonFile  = require('jsonfile');
const fs        = require('fs');

const login = async (page) => {
  await page.goto('https://frontendmasters.com/login/', { timeout: 0, waitUntil: 'domcontentloaded' });
  await page.type('input#username', 'me.majiidii@gmail.com');
  await page.type('input#password', 'QeY3qbrcP9jFTpx');

  await Promise.all([
    page.click('form button'),
    page.waitForNavigation({ waitUntil: 'domcontentloaded' })
  ]);

  const cookiesObject = await page.cookies();
  await jsonFile.writeFile('cookies.json', cookiesObject);
};

const getLoginCookies = async () => {
  if (fs.existsSync('cookies.json')) {
    const previousSession = await jsonFile.readFile('cookies.json');
    return (previousSession && previousSession.length) ? previousSession : false;
  } else {
    return false;
  }
};

const parseCoursesPage = async (page) => {
  const courses = await page.$$('.MediaList > li.MediaItem');
  console.log(courses.length);
};

(async () => {
  const browser = await puppeteer.launch({
    headless: true
  });

  const page = await browser.newPage();
  const loginCookies = await getLoginCookies();
  
  if (loginCookies) {
    for (cookie of loginCookies) {
      await page.setCookie(cookie);
    }
  } else {
    await login(page);
  }

  
  await page.goto('https://frontendmasters.com/courses/#all', { timeout: 0, waitUntil: 'networkidle0' });
  await new Promise((resolve, reject) => setTimeout(() => resolve()), 10000);
  await parseCoursesPage(page);
})();