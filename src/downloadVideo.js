const request = require('request');
const fs = require('fs');
const progress = require('request-progress');
const _cliProgress = require('cli-progress');
const colors = require('colors');

function download(uri, filename, title) {
    return new Promise(function (resolve, reject) {
        request.head(uri, function (err, res, body) {
            if (!err && res.statusCode == 200) {
                const dlBar = new _cliProgress.SingleBar({
                    format: 'Download Progress |' + '{bar}' + '| ' +  colors.cyan('{filename}')  + ' | {percentage}%',
                }, _cliProgress.Presets.legacy);

                dlBar.start(1, 0);
                dlBar.update(0, { filename: title });

                progress(request(uri))
                .on('progress', function(state) {
                    // console.log(state);
                    dlBar.update(state.percent, { filename: title });
                })
                .on('error', function(response) {
                    console.log(err);
                    reject(new Error(err));
                })
                .on('close', function() {
                    dlBar.update(1);
                    dlBar.stop();
                    resolve();
                })
                .pipe(fs.createWriteStream(filename))
            } else {
                reject(new Error(err));
            }
        });
    });
}


module.exports = download;