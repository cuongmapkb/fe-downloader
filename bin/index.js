#!/usr/bin/env node

const args = require('args');
const downloader = require('./fe-downloader');

args.option('delay', 'Waiting time between downloads (in minute)', 5);
const flags = args.parse(process.argv);

(async () => {
    await downloader(flags);
})();