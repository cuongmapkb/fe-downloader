const puppeteer = require('puppeteer');
const jsonFile  = require('jsonfile');
const fs        = require('fs');
const { AutoComplete, Input, Password } = require('enquirer');
const cheerio = require('cheerio');
const download = require('./download');
const parseCoursePage = require('./parseCoursePage');
const fse = require('fs-extra');
const path = require('path');
const colors = require('colors');



const login = async (page) => {
  await page.goto('https://frontendmasters.com/login/', { timeout: 0, waitUntil: 'domcontentloaded' });
  const usernamePrompt = new Input({ message: 'Enter your email '});
  const email = await usernamePrompt.run();
  
  const passwordPrompt = new Password({ message: 'Enter your password' });
  const password = await passwordPrompt.run();
  
  await page.type('input#username', email);
  await page.type('input#password', password);

  await Promise.all([
    page.click('form button'),
    page.waitForNavigation({ waitUntil: 'domcontentloaded' })
  ]);

  const url = await page.url();
  
  if (url.match(/login/gi)) {
    console.log('✖ Incorrect credentials, try again'.red);
    process.exit();
  }

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

const parseCoursesPage = async (html) => {
  const $ = cheerio.load(html);

  if ($('a[href="#free"]').length) {
    console.log('✖ This account is not premium, try another account'.red);
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

(async () => {
  const browser = await puppeteer.launch({
    headless: true
  });
  const page = await browser.newPage();
  const loginCookies = await getLoginCookies();
  
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36');

  if (loginCookies) {
    for (cookie of loginCookies) {
      await page.setCookie(cookie);
    }
  } else {
    await login(page);
  }
  console.log('✔ Successfully logged in'.green);
  console.log('? Fetching courses list'.yellow);
  
  await page.goto('https://frontendmasters.com/courses/', { timeout: 0 });
  await page.waitForSelector('.MediaList > li.MediaItem');
  
  const html = await page.content();
  const courses = await parseCoursesPage(html);


  const prompt = new AutoComplete({
    name: 'Course to download',
    message: 'Select course to download',
    limit: 50,
    choices: courses.map(course => course.title)
  });

  const answer = await prompt.run();

  const locationPrompt = new Input({
    message: 'Enter download location',
  });

  const location = await locationPrompt.run();

  console.log(`Downloading '${answer}'`.blue);
  const url = courses.find(c => c.title === answer).url;

  await page.goto('https://frontendmasters.com' + url, { timeout: 0, waitUntil: 'domcontentloaded' });
  await Promise.all([
    page.click('a.Button.ButtonRed'),
    page.waitForNavigation({ waitUntil: 'domcontentloaded' })
  ]);

  await page.waitForSelector('.FMPlayerScrolling > li');

  const coursePageHtml = await page.content();
  const course = parseCoursePage(coursePageHtml);


  let count = 0;
  fse.ensureDir(path.resolve(location, answer));

  for (let sectionName of Object.keys(course)) {
    const section = course[sectionName];
    const sectionDir = path.resolve(location, answer, sectionName);
    fse.ensureDirSync(sectionDir);


    for (let video of section) {
      count++;
      const videoDir = path.resolve(sectionDir, `${count}-${video.title}`);

      if (fs.existsSync(videoDir)) {
        console.log(`✔ You already downloaded '${count}-${video.title}'`.green);
        continue;
      }

      await page.click(`a[href="${video.href}"]`);
      await page.waitFor(2000);
      
      const url = await page.evaluate(() => {
        return document.querySelector('video').src
      });
      
      await download(url, videoDir, video.title);
    }
  }


  console.log(`✔ Successfully downloaded '${answer}'`.green);
  await page.close();
  await browser.close();
  process.exit();
})();