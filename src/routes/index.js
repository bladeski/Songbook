var express = require('express');
var router = express.Router();
var fs = require('fs-plus');

var songList = [],
    path = './src/public/data';

function getTitle(song) {
    var titleSplit = song.split('{title:'),
        title = titleSplit != song ? titleSplit[titleSplit.length - 1].split('}')[0] : '';

    return title.trim();
}

function getSong(name, callback) {
    fs.readdir(path, function(err, items) {

        var song = items.find(function (item) {
                return item.substr(-4) === '.pro' && item.substring(0, item.length - 4) === name;
            }),
            readStream,
            songData = '';

        readStream = fs.createReadStream(path + '/' + song);

        readStream.on('data', function (chunk) {
            songData += chunk;
        }).on('end', function () {
            callback && callback(songData);
        });
    });
}

function processSong(song) {
    var titleSplit = song.split('{title:'),
        title = titleSplit != song ? titleSplit[titleSplit.length - 1].split('}')[0] : '',
        subtitleSplit = song.split('{subtitle:'),
        subtitle = subtitleSplit != song ? subtitleSplit[subtitleSplit.length - 1].split('}')[0] : '',
        keySplit = song.split('{key:'),
        key = keySplit != song ? keySplit[keySplit.length - 1].split('}')[0] : '',
        songData = song.split('{title:' + title + '}').join('')
            .split('{subtitle:' + subtitle + '}').join('')
            .split('{key:' + key + '}').join('').trim()
            .replace(/{soc}/g, '{soc}**CHORUS**'),
        splitSong = songData.split('{soc}'),//songData.split(/\n\s*\n/g),
        processedSong = [],
        returnData;

        splitSong.forEach(function (section) {
            var containsChorus = section.substr(0, 10) === '**CHORUS**',
                splitVerse,
                splitChorus;

            if (containsChorus) {
                splitChorus = section.split('{eoc}');

                var data = splitChorus[0].substr(10).trim();

                if (data) {
                    processedSong.push({
                        type: 'chorus',
                        data: data
                    });
                }

                section = splitChorus[1];
            }

            splitVerse = section.split(/\n\s*\n/g);

            splitVerse.forEach(function (split) {
                var data = split.trim();

                if (data) {
                    processedSong.push({
                        type: 'verse',
                        data: data
                    });
                }
            });
        });

    returnData = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        key: key.trim(),
        song: processedSong
    };

    return JSON.stringify(returnData);
}

fs.readdir(path, function(err, items) {

    var counter = 0,
        songs = items.filter(function (song) {
            return song.substr(-4) === '.pro';
        });

    songs.forEach(function (song) {

        var readStream = fs.createReadStream(path + '/' + song),
            songData = '';
        readStream.on('data', function (chunk) {
            songData += chunk;
        }).on('end', function () {
            songList.push({songTitle: getTitle(songData), url: song.substring(0, song.length - 4)});
            counter++;
            if (counter === songs.length) {
                fs.writeFile(path + '/songList.json', JSON.stringify(songList), function () {
                    console.log('Song list created.');
                });
            }
        });
    });
});

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Songbook' });
});

router.get('/director', function(req, res, next) {
    res.render('director', { title: 'Songbook' });
});

router.get('/musician', function(req, res, next) {
    res.render('musician', { title: 'Songbook' });
});

router.get('/song', function(req, res, next) {
    var isAjaxRequest = req.xhr;

    if (isAjaxRequest) {
        getSong(req.query.name, function (song) {
            res.json(processSong(song));
        })
    } else {
        res.render('index', { title: 'Songbook' });
    }
});

module.exports = router;
