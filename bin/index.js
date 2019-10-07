#!/usr/bin/env node

const args = require('args');
const downloader = require('./fe-downloader');

args
    .option('delay', 'Waiting time between downloads (in minute)', 5)
    .option('open-browser', 'Open chromium to see what happens', false);
const flags = args.parse(process.argv);

(async () => {
    await downloader(flags);
})();