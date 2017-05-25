define(['knockout'], function (ko) {
    var songViewModel = {
            songTitle: ko.observable('Title'),
            songSubTitle: ko.observable('Subtitle'),
            formattedSong: ko.observableArray(),
            key: ko.observable(),
            newKey: ko.observable(),
            songDOMContainer: null,
            keyOptions: ['A','A#','B','C','C#','D','D#','E','F','F#','G','G#'],
            keyOptionsAlt: ['A','Bb','B','C','Db','D','Eb','E','F','Gb','G','Ab']
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
        songViewModel.songTitle(song.songTitle ? song.songTitle : songViewModel.songTitle());
        songViewModel.songSubTitle(song.songSubTitle ? song.songSubTitle : songViewModel.songSubTitle());
        songViewModel.formattedSong(song.formattedSong ? formatSong(song.formattedSong) : songViewModel.formattedSong());
        songViewModel.key(song.key ? (songViewModel.getKeyIndex(song.key) >= 0 ? songViewModel.getKeyIndex(song.key) : 0) : songViewModel.key());
        songViewModel.newKey(songViewModel.key());
        songViewModel.songDOMContainer = song.songDOMContainer ? song.songDOMContainer : songViewModel.songDOMContainer;
    }

    songViewModel.getKeyIndex = function (key) {
        var keyIndex = songViewModel.keyOptions.findIndex(function (keyOption) {
                return key === keyOption;
            });

        if (keyIndex < 0) {
            keyIndex = songViewModel.keyOptionsAlt.findIndex(function (keyOption) {
                return key === keyOption;
            });
        }

        return keyIndex;
    }

    songViewModel.newKey.subscribe(function (newValue) {
        if (newValue === songViewModel.key() || songViewModel.songDOMContainer === null) {
            return;
        }

        var keyIndex = songViewModel.keyOptions.findIndex(function (key) {
                return key === songViewModel.key();
            }),
            newKeyIndex = songViewModel.keyOptions.findIndex(function (key) {
                return key === newValue;
            }),
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
                    newChord += songViewModel.keyOptions[newChar + step];
                } else if (newChar >= 0 && newChar + step < 0) {
                    newChord += songViewModel.keyOptions[songViewModel.keyOptions.length + newChar + step];
                } else if (newChar >= 0 && newChar + step >= songViewModel.keyOptions.length) {
                    newChord += songViewModel.keyOptions[newChar + step - songViewModel.keyOptions.length];
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
