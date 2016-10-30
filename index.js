var https = require("https");

function googleSitesManager() {
    "use strict";
    var x = Math.random();;

    function list(specs) {
        var entries = [];

        return new Promise(function (resolve, reject) {


            function listEntries(options) {
                var req = https.request(options, function (res) {
                    var output = "";
                    console.log(options.host + ':' + res.statusCode + ':' + x + ':' + options.headers.Authorization);

                    if (res.statusCode === 404 || res.statusCode === 403 || res.statusCode === 401) {
                        reject(res.statusCode);
                        return;
                    }
                    res.setEncoding('utf8');

                    res.on('data', function (chunk) {
                        output += chunk;
                    });

                    res.on('end', function () {
                        var response = JSON.parse(output);
                        var next = response.feed.link.filter(
                            function (entry) {
                                return entry.rel === "next";
                            }
                        );
                        if (response.feed.entry) {
                            entries = entries.concat(response.feed.entry);
                        }
                        if (next.length > 0) {
                            options.path = next[0].href;
                            listEntries(options);
                        } else {
                            resolve(entries);
                        }
                    });
                });

                req.on('error', function (err) {
                    reject(err);
                });

                req.end();
            }
            listEntries(specs.options);
        });

    }

    return {
        listEntries: list
    };
}

module.exports = googleSitesManager;