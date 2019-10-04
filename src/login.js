const { Input, Password } = require('enquirer');

const storeCookies = (email, cookies) => {
    await jsonFile.writeFile('cookies.json', {
        email,
        cookies
    });
};

const readCookies = () => {

};

const login = async (page) => {
    await page.goto('https://frontendmasters.com/login/', { timeout: 0, waitUntil: 'domcontentloaded' });
    
    const usernamePrompt = new Input({ message: 'Enter your email'});
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
    await storeCookies(email, cookiesObject);
};




module.exports = login;