define(['knockout'], function (ko) {
    var songViewModel = {
            songTitle: ko.observable('Title'),
            songSubTitle: ko.observable('Subtitle'),
            formattedSong: ko.observableArray(),
            viewMode: ko.observable(false),
            key: ko.observable(),
            newKey: ko.observable(),
            originalKey: ko.observable(),
            songDOMContainer: null,
            keyOptions: [{key: 'A'},
                {key: 'A#', altKey: 'Bb'},
                {key: 'B'},
                {key: 'C'},
                {key: 'C#', altKey: 'Db'},
                {key: 'D'},
                {key: 'D#', altKey: 'Eb'},
                {key: 'E'},
                {key: 'F'},
                {key: 'F#', altKey: 'Gb'},
                {key: 'G'},
                {key: 'G#', altKey: 'Ab'}],
            capoOptions: ko.observableArray()
        };

    function splitChords (song) {
        return song.replace(/\[/g, '<span class="chord">').replace(/\]/g, '</span><span class="chord-space"></span>');
    }

    function nl2br (str) {
        var splitLines = (str + '').split('\n'),
            html = '';
        splitLines.forEach(function (line) {
            if (line.includes('{soc}') || line.includes('{eoc}')) {
                html += line;
            } else {
                html += '<div class="song-line">' + line + '</div>';
            }
        });

        return html;
    }

    function formatSong (song) {
        var formattedSong = [];

        song.forEach(function (section) {
            var sectionWithBreaks = nl2br(section.data);
            section.data = splitChords(sectionWithBreaks);
            formattedSong.push(section);
        });

        return formattedSong;
    }

    songViewModel.originalKey.subscribe(function (newValue) {
        var options = [],
            keyIndex = songViewModel.getKeyIndex(newValue);

        songViewModel.keyOptions.forEach(function (key, index) {
            // var capoKeyIndex = songViewModel.getKeyIndex(key.key);

            if (keyIndex > index) {
                options[keyIndex - index] = { key: key.key, displayKey: 'Capo ' + (keyIndex - index) + ' - ' + key.key };
            } else if (keyIndex === index) {
                options[0] = { key: key.key, displayKey: 'Capo ' + (0) + ' - ' + key.key };
            } else {
                options[songViewModel.keyOptions.length - index + keyIndex] = { key: key.key, displayKey: 'Capo ' + (songViewModel.keyOptions.length - index + keyIndex) + ' - ' + key.key };
            }
        });

        songViewModel.capoOptions(options);
    });

    songViewModel.spaceChord = function (chord, nextChord) {
        nextChord.style.left = '';
        var rect1 = chord.getBoundingClientRect(),
            rect2 = nextChord.getBoundingClientRect();

        if (!(rect1.right < rect2.left || rect1.bottom < rect2.top || rect1.top > rect2.bottom)) { // Overlap
            var movement = rect1.width + 4 + chord.offsetLeft;

            nextChord.style.left = movement + 'px';
            nextChord.nextSibling.style.width = nextChord.offsetLeft - nextChord.nextSibling.offsetLeft + 'px';
        }
    }

    songViewModel.setDOMContainerById = function (id) {
        songViewModel.songDOMContainer = document.getElementById(id);
    }

    songViewModel.updateSong = function (song) {
        songViewModel.viewMode(song.viewMode || false);
        songViewModel.songTitle(song.title ? song.title : '');
        songViewModel.songSubTitle(song.subTitle ? song.subTitle : '');
        songViewModel.formattedSong(song.song ? formatSong(song.song) : '');
        songViewModel.key(song.key ? song.key : 'C');
        songViewModel.newKey(songViewModel.key());
        songViewModel.songDOMContainer = song.songDOMContainer ? song.songDOMContainer : songViewModel.songDOMContainer;
    }

    songViewModel.getKeyIndex = function (key) {
        return songViewModel.keyOptions.findIndex(function (keyOption) {
            return key === keyOption.key || key === keyOption.altKey;
        });
    }

    songViewModel.getKeyDisplayText = function (key) {
        return key.key + ' - Capo ' + songViewModel.getKeyIndex(key.key);
    }

    songViewModel.newKey.subscribe(function (newValue) {
        if (!songViewModel.key() || newValue === songViewModel.key() || songViewModel.songDOMContainer === null) {
            return;
        }

        var keyIndex = songViewModel.getKeyIndex(songViewModel.key()),
            newKeyIndex = songViewModel.getKeyIndex(newValue),
            step = newKeyIndex - keyIndex;

        songViewModel.key(newValue);

        var chords = songViewModel.songDOMContainer.getElementsByClassName('chord');

        for (var i = 0; i < (chords.length - 1); i++) {
            var newChord = '';
            for (var j = 0; j < chords[i].innerText.length; j++) {
                var chord = chords[i].innerText[j];

                if (chords[i].innerText[j + 1] === '#') {
                    chord += '#';
                    j++;
                } else if (chords[i].innerText[j + 1] === 'b') {
                    chord += 'b';
                    j++;
                }

                var newChar = songViewModel.getKeyIndex(chord);

                if (newChar >= 0 && newChar + step >= 0 && newChar + step < songViewModel.keyOptions.length) {
                    newChord += songViewModel.keyOptions[newChar + step].key;
                } else if (newChar >= 0 && newChar + step < 0) {
                    newChord += songViewModel.keyOptions[songViewModel.keyOptions.length + newChar + step].key;
                } else if (newChar >= 0 && newChar + step >= songViewModel.keyOptions.length) {
                    newChord += songViewModel.keyOptions[newChar + step - songViewModel.keyOptions.length].key;
                } else {
                    newChord += chords[i].innerText[j];
                }
            }

            chords[i].innerText = newChord;

            songViewModel.spaceChord(chords[i], chords[i + 1]);
        }
    });

    return songViewModel;
});
