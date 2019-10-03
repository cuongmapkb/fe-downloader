const puppeteer = require('puppeteer');
const jsonFile  = require('jsonfile');
const fs        = require('fs');
const { AutoComplete } = require('enquirer');

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
  const courses = await page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('.MediaList > li.MediaItem'));
    
    return nodes.map((node) => {
      return {
        title: node.querySelector('.title a').innerHTML,
        url: node.querySelector('.title a').href
      };
    });
  });

  return courses;
};

(async () => {
  const browser = await puppeteer.launch({
    headless: true
  });
  const page = await browser.newPage();
  const loginCookies = await getLoginCookies();
  
  // await page.setUserAgent(userAgent);
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36');


  if (loginCookies) {
    for (cookie of loginCookies) {
      await page.setCookie(cookie);
    }
  } else {
    await login(page);
  }
  console.log('successfully logged in!');
  
  await page.goto('https://frontendmasters.com/courses/#all', { timeout: 0 });
  await page.screenshot({ path: './ag.jpeg', type: 'jpeg' });
  await page.waitForSelector('.MediaList > li.MediaItem');
  const courses = await parseCoursesPage(page);


  const prompt = new AutoComplete({
    name: 'Course to download',
    message: 'Select course to download',
    limit: 50,
    choices: courses.map(course => course.title)
  });

  prompt.run()
    .then(answer => console.log('Answer: ', answer))
    .catch(console.error);
})();