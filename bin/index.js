#!/usr/bin/env node

const args = require('args');
const downloader = require('./fe-downloader');

args
    .option('delay', 'Waiting time between downloads (in minute)', 1)
    .option('download-subtitles', 'Download subtitles', true)
    .option('open-browser', 'Open chromium to see what happens', true);
const flags = args.parse(process.argv);

(async () => {
    await downloader(flags);
})();