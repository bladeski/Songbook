define(['knockout'], function (ko) {
    var songViewModel = {
            songTitle: ko.observable('Title'),
            songSubTitle: ko.observable('Subtitle'),
            formattedSong: ko.observableArray(),
            viewMode: ko.observable(false),
            currentKey: ko.observable(),
            capoKey: ko.observable(),
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
            capoOptions: ko.observableArray([{key: 'A', capo: ko.observable(3)},
                {key: 'A#', altKey: 'Bb', capo: ko.observable(2)},
                {key: 'B', capo: ko.observable(1)},
                {key: 'C', capo: ko.observable(0)},
                {key: 'C#', altKey: 'Db', capo: ko.observable(11)},
                {key: 'D', capo: ko.observable(10)},
                {key: 'D#', altKey: 'Eb', capo: ko.observable(9)},
                {key: 'E', capo: ko.observable(8)},
                {key: 'F', capo: ko.observable(7)},
                {key: 'F#', altKey: 'Gb', capo: ko.observable(6)},
                {key: 'G', capo: ko.observable(5)},
                {key: 'G#', altKey: 'Ab', capo: ko.observable(4)}])
        };

    // function splitChords (song) {
    //     return song.replace(/\[/g, '<span class="chord">').replace(/\]/g, '</span><span class="chord-space"></span>');
    // }
    //
    // function nl2br (str) {
    //     var splitLines = (str + '').split('\n'),
    //         html = '';
    //     splitLines.forEach(function (line) {
    //         if (line.includes('{soc}') || line.includes('{eoc}')) {
    //             html += line;
    //         } else {
    //             html += '<div class="song-line">' + line + '</div>';
    //         }
    //     });
    //
    //     return html;
    // }

    function formatSong (song) {
        var formattedSong = [];

        song.forEach(function (section) {
            var newSection = {
                type: ko.observable(section.type),
                data: ko.observableArray()
            };

            section.data.forEach(function (line) {
                var newLine = ko.observableArray();

                line.forEach(function (part) {
                    newLine.push({
                        type: ko.observable(part.type),
                        data: ko.observable(part.data)
                    });
                });
                newSection.data.push(newLine);
            });

            formattedSong.push(newSection);
        });

        return formattedSong;
    }

    function changeKey (step) {
        var chords = songViewModel.songDOMContainer.getElementsByClassName('chord');

        for (var i = 0; i < (chords.length - 1); i++) {
            var newChord = '',
                chordAttr = chords[i].getAttribute('data-chord');
            for (var j = 0; j < chordAttr.length; j++) {
                var chord = chordAttr[j];

                if (chordAttr[j + 1] === '#') {
                    chord += '#';
                    j++;
                } else if (chordAttr[j + 1] === 'b') {
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
                    newChord += chordAttr[j];
                }
            }

            chords[i].innerText = newChord;

            songViewModel.spaceChord(chords[i], chords[i + 1]);
        }
    }

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
        songViewModel.updating = true;
        songViewModel.viewMode(song.viewMode || false);
        songViewModel.songTitle(song.title ? song.title : '');
        songViewModel.songSubTitle(song.subTitle ? song.subTitle : '');
        songViewModel.formattedSong(song.song ? formatSong(song.song) : '');
        songViewModel.currentKey(song.key ? song.key : 'C');
        songViewModel.capoKey(song.key ? song.key : 'C');
        songViewModel.originalKey(song.key ? song.key : 'C');
        songViewModel.songDOMContainer = song.songDOMContainer ? song.songDOMContainer : songViewModel.songDOMContainer;
        songViewModel.updating = false;
    }

    songViewModel.getKeyIndex = function (key) {
        return songViewModel.keyOptions.findIndex(function (keyOption) {
            return key === keyOption.key || key === keyOption.altKey;
        });
    }

    songViewModel.getKeyDisplayText = function (key) {
        return key.key + ' - Capo ' + songViewModel.getKeyIndex(key.key);
    }

    songViewModel.originalKey.subscribe(function (newValue) {
        var options = [],
            keyIndex = songViewModel.getKeyIndex(newValue);

        songViewModel.keyOptions.forEach(function (key, index) {

            if (keyIndex > index) {
                songViewModel.capoOptions().find(function (capo) {
                    return capo.key === key.key;
                }).capo(keyIndex - index);
            } else if (keyIndex === index) {
                songViewModel.capoOptions().find(function (capo) {
                    return capo.key === key.key;
                }).capo(0);
            } else {
                songViewModel.capoOptions().find(function (capo) {
                    return capo.key === key.key;
                }).capo(songViewModel.keyOptions.length - index + keyIndex);
            }
        });

        songViewModel.capoOptions(songViewModel.capoOptions().sort(function(a, b) {
            return a.capo() > b.capo() ? 1 : a.capo() < b.capo() ? -1 : 0;
        }));
    });

    songViewModel.currentKey.subscribe(function (newValue) {
        if (!songViewModel.originalKey() || !newValue || songViewModel.songDOMContainer === null || songViewModel.updating) {
            return;
        }

        var keyIndex = songViewModel.getKeyIndex(songViewModel.originalKey()),
            newKeyIndex = songViewModel.getKeyIndex(newValue),
            step = newKeyIndex - keyIndex;

        //songViewModel.key(newValue);

        changeKey(step);
    });

    songViewModel.capoKey.subscribe(function (newValue) {
        if (!songViewModel.currentKey() || !newValue || songViewModel.songDOMContainer === null || songViewModel.updating) {
            return;
        }

        var keyIndex = songViewModel.getKeyIndex(songViewModel.currentKey()),
            newKeyIndex = songViewModel.getKeyIndex(newValue),
            step = newKeyIndex - keyIndex;

        //songViewModel.key(newValue);

        changeKey(step);
    });

    return songViewModel;
});
