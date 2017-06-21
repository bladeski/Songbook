(function() {
    'use strict';

    requirejs([
        'jquery',
        'knockout',
        'bootstrap',
        'socket.io',
        'songViewModel',
        'menuViewModel'
    ], function($, ko, bootstrap, io, songViewModel, menuViewModel) {

        var viewModel = {
                songViewModel: songViewModel,
                menuViewModel: menuViewModel,
                currentSong: ko.observable(),
                song: ko.observable(),
                songOptions: ko.observableArray(),
                role: ''
            },
            socket = io();

        function getQueryStringValue (key) {
            return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
        }

        viewModel.menuViewModel.initialiseMenu(document.getElementsByClassName('songlist')[0], function (songList) {

            var songName = getQueryStringValue('name');

            if (window.location.pathname === '/song' && songName) {
                var currentSong = songList.find(function (song) {
                    return song.songTitle === songName;
                });

                if (currentSong) {
                    viewModel.selectSong(currentSong);
                } else {
                    viewModel.menuViewModel.toggleMenu();
                }
            } else {
                viewModel.toggleMenu();
            }

            socket.on('Change Song', function (song) {
                viewModel.selectSong(song);
            });
        });

        viewModel.songViewModel.setDOMContainerById('song');

        viewModel.currentSong.subscribe(function (newValue) {
            $.ajax({
                url: '/song?name=' + newValue.url
            }).done(function(data) {
                var songData = JSON.parse(data);
                socket.emit('Director Change Song', data);
                viewModel.song(songData);

                viewModel.songViewModel.updateSong(songData);

                setTimeout(function () {
                    var chords = viewModel.songViewModel.songDOMContainer.getElementsByClassName('chord');

                    for (var i = 0; i < (chords.length - 1); i++) {
                        viewModel.songViewModel.spaceChord(chords[i], chords[i + 1]);
                    }
                }, 0);
            });
        });

        viewModel.selectSong = function (data) {
            var url = window.location.origin + '/song?name=' + encodeURIComponent(data.songTitle),
                song = viewModel.currentSong();

            if (song && song.url === data.url && song.songTitle === data.songTitle) {
                if (data.key) {
                    viewModel.songViewModel.newKey(data.key ? data.key : viewModel.songViewModel.keyOptions[keyIndex]);
                }
            } else {
                viewModel.currentSong(data);
                window.history.pushState(null, data.songTitle, url);
            }
            //socket.emit('Director Change Song', data);
        }

        // viewModel.songViewModel.newKey.subscribe(function (newValue) {
        //
        // });

        viewModel.changeSong = function (data) {

            viewModel.selectSong(data);
        }

        ko.applyBindings(viewModel);
    });
})();
