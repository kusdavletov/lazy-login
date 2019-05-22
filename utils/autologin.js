const puppeteer = require('puppeteer');
const querystring = require('querystring');

const usernames = ['username', 'name', 'id', 'email', 'account'];
const passwords = ['password', 'pass', 'pw', 'pwd'];

function validPostData(postDataString, username, password) {
    let contains_username = false;
    let contains_password = false;

    let postData = querystring.parse(postDataString);

    for (const [key, value] of Object.entries(postData)) {
        if (value === username) {
            contains_username = true;
        }
        if (value === password) {
            contains_password = true;
        }
    }
    return contains_username && contains_password;
}

function isUsername(inputDict) {
    if (inputDict['value'] || inputDict['type'] === 'hidden') {
        return false;
    }

    for (const [key, value] of Object.entries(inputDict)) {
        for (let index = 0; index < usernames.length; index++) {
            if (value && value.toLowerCase().includes(usernames[index])) {
                return true;
            }
        }
    }
    return false;
}

function isPassword(inputDict) {
    if (inputDict['type'] === 'password') {
        return true;
    }
    if (inputDict['value'] || inputDict['type'] === 'hidden') {
        return false;
    }

    for (const [key, value] of Object.entries(inputDict)) {
        for (let index = 0; index < passwords.length; index++) {
            if (value && value.toLowerCase().includes(passwords[index])) {
                return true;
            }
        }
    }
    return false;
}

async function autologin(url, username, password) {
    let cookie = '', postUrl = '', postData = {};

    const puppeteerArgs = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'];
    // const puppeteerArgs = ['--disable-dev-shm-usage'];
    const browser = await puppeteer.launch({
        // executablePath: '/usr/bin/chromium-browser',
        headless: true,
        args: puppeteerArgs
    });
    const page = await browser.newPage();
    await page.setRequestInterception(true);

    page.on('request', request => {
        if (request.method() === 'POST' && validPostData(request.postData(), username, password)) {
            postUrl = request.url();
            postData = querystring.parse(request.postData());
        }
        request.continue();
    });

    await page.goto(url, { waitUntil: 'networkidle0' });

    let inputs = await page.$$('input');

    let usernameFilled = false;
    let passwordFilled = false;

    for (let index = 0; index < inputs.length; index++) {
        const inputInfo = await page.evaluate(input => {
            let attributes = {};
            input.getAttributeNames().forEach(name => { attributes[name] = input.getAttribute(name); });
            return attributes;
        }, inputs[index]);

        if (!usernameFilled && isUsername(inputInfo)) {
            await inputs[index].type(username);
            usernameFilled = true;
        }
        if (!passwordFilled && isPassword(inputInfo)) {
            await inputs[index].type(password);
            passwordFilled = true;
        }
    }

    // type=button
    const button = await page.$('button[type="submit"]');
    const input = await page.$('input[type="submit"]');

    if (button) {
        await page.evaluate(button => button.click(), button);
    } else if (input) {
        await page.evaluate(input => input.click(), input);
    } else {
        await page.keyboard.press('Enter');
    }

    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    const cookies = await page.cookies();
    for (let index = 0; index < cookies.length; index++) {
        cookie += cookies[index].name + '=' + cookies[index].value + ';'
    }

    await browser.close();

    return {cookie: cookie, postUrl: postUrl, postData: postData};
}

module.exports = autologin;