const {
    Input,
    Password,
    Toggle
} = require('enquirer');
const {
    closeBrowser
} = require('./browser');
const path = require('path');
const fs = require('fs');
const jsonFile = require('jsonfile');
const colors = require('colors');
const __cookie = require('cookie');

const AUTH_FILE_PATH = path.resolve(__dirname, '..', 'auth.json');

const storeCookies = async (email, cookies) => {
    await jsonFile.writeFile(AUTH_FILE_PATH, {
        email,
        cookies
    });
};

const getPrevCookies = async () => {
    if (fs.existsSync(AUTH_FILE_PATH)) {
        try {
            const previousSession = await jsonFile.readFile(AUTH_FILE_PATH);
            if (previousSession && previousSession.cookies.length) {
                return previousSession;
            } else if (typeof previousSession.cookie.length === 'string') {
                return previousSession;
            } else {
                return null;
            }
        } catch (readJSONErr) {
            return null;
        }
    } else {
        return null;
    }
};

const startNewSession = async (page) => {
    await page.goto('https://frontendmasters.com/login/', {
        timeout: 0,
        waitUntil: 'domcontentloaded'
    });

    console.log('✔ Enter your FrontendMasters account information'.yellow);
    const usernamePrompt = new Input({
        message: 'Email'
    });
    const email = await usernamePrompt.run();

    const passwordPrompt = new Password({
        message: 'Password'
    });
    const password = await passwordPrompt.run();

    await page.type('input#username', email);
    await page.type('input#password', password);

    try {
        await Promise.all([
            page.click('form button'),
            page.waitForNavigation({
                timeout: 15000,
                waitUntil: 'domcontentloaded'
            })
        ]);
    } catch (loginError) {
        console.log('✖ Failed to login because of Recaptcha, please login manually and paste your cookies below'.red);
        const cookiesInput = new Input({
            message: 'cookies'
        });
        const cookies = await cookiesInput.run();

        const parsedCookiesObj = __cookie.parse(cookies);
        console.log(parsedCookiesObj);
        const parsedCookies = [];

        for (let key of Object.keys(parsedCookiesObj)) {
            parsedCookies.push({
                name: key,
                value: parsedCookiesObj[key],
                url: 'https://frontendmasters.com'
            });
        }


        for (let cookie of parsedCookies) {
            await page.setCookie(cookie);
        }

        const cookiesObject = await page.cookies();
        await storeCookies('', cookiesObject);

        return Promise.resolve();
    }


    const url = await page.url();
    if (url.match(/login/gi)) {
        console.log('✖ Incorrect credentials, try again'.red);
        closeBrowser();
        process.exit();
    }

    const cookiesObject = await page.cookies();
    await storeCookies(email, cookiesObject);
};

const checkIfSessionIsExpired = async (page) => {
    await page.goto('https://frontendmasters.com', {
        timeout: 0,
        waitUntil: 'domcontentloaded'
    });

    if (await page.$('a[href*="/login/"]')) {
        console.log('✖ Your session has expired, try loggin again'.red);
        return Promise.reject();
    }
};

const login = async (page) => {
    const previousSession = await getPrevCookies();

    if (previousSession) {
        const confirmUsingLastSessionPrompt = new Toggle({
            message: `Want to continue your last session ${previousSession.email.length ? "as " + colors.brightRed(previousSession.email) : "" }?`,
            enabled: 'Yes',
            disabled: 'No'
        });

        const continueLastSession = await confirmUsingLastSessionPrompt.run();
        if (!continueLastSession) {
            await startNewSession(page);
        } else {
            if (typeof previousSession.cookies === 'string') {
                const parsedCookiesObj = __cookie.parse(previousSession.cookies);
                const parsedCookies = [];

                for (let key of Object.keys(parsedCookiesObj)) {
                    parsedCookies.push({
                        name: key,
                        value: parsedCookiesObj[key],
                        url: 'https://frontendmasters.com'
                    });
                }


                for (let cookie of parsedCookies) {
                    await page.setCookie(cookie);
                }
            } else {
                for (let cookie of previousSession.cookies) {
                    await page.setCookie(cookie);
                }
            }

            try {
                await checkIfSessionIsExpired(page);
            } catch (sessionExpiredError) {
                return await startNewSession(page);
            }
        }
    } else {
        await startNewSession(page);
    }
};




module.exports = login;