const { RequestInterceptor, RequestSpy } = require('puppeteer-request-spy');

const matcher = (testee) => {
    console.log('called');
    return testee.indexOf('vtt') > -1;
}


const requestInterceptor = new RequestInterceptor(matcher);

const subtitleSpy = new RequestSpy('/sd');

requestInterceptor.addSpy(subtitleSpy);

module.exports = requestInterceptor;