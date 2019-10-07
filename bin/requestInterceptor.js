const { RequestInterceptor, RequestSpy } = require('puppeteer-request-spy');
const isSubtitleRegexp = new RegExp(/\.vtt/ig);


const matcher = (testee, keywoard) => {
    return testee.indexOf(keywoard) > -1;
};


const requestInterceptor = new RequestInterceptor(matcher);

const subtitleSpy = new RequestSpy('.vtt');

requestInterceptor.addSpy(subtitleSpy);

module.exports = {
    requestInterceptor,
    subtitleSpy
};