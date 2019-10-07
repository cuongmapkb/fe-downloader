const request = require('request');
const fs = require('fs');

function download(uri, filename) {
    return new Promise(function (resolve, reject) {
        request.head(uri, function (err, res, body) {
            if (!err && res.statusCode == 200) {
                request(uri)
                .on('error', function(response) {
                    reject(new Error(err));
                })
                .on('close', function() {
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