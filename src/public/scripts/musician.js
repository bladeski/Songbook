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
                role: 'musician'
            },
            socket = io();

        function getQueryStringValue (key) {
            return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
        }

        viewModel.songViewModel.setDOMContainerById('song');

        // viewModel.currentSong.subscribe(function (newValue) {
        //     $.ajax({
        //         url: '/song?name=' + newValue.url
        //     }).done(function(data) {
        //         var songData = JSON.parse(data)
        //         viewModel.song(songData);
        //
        //         var song = {
        //                 viewMode: true,
        //                 songTitle: songData.title,
        //                 songSubTitle: songData.subtitle,
        //                 formattedSong: songData.song,
        //                 key: songData.key
        //             };
        //
        //         viewModel.songViewModel.updateSong(song);
        //
        //         setTimeout(function () {
        //             var chords = viewModel.songViewModel.songDOMContainer.getElementsByClassName('chord');
        //
        //             for (var i = 0; i < (chords.length - 1); i++) {
        //                 viewModel.songViewModel.spaceChord(chords[i], chords[i + 1]);
        //             }
        //         }, 0);
        //     });
        // });

        viewModel.selectSong = function (data) {
            var song = viewModel.currentSong();

            if (song && song.url === data.url && song.songTitle === data.songTitle) {
                if (data.key) {
                    viewModel.songViewModel.newKey(data.key ? data.key : viewModel.songViewModel.keyOptions[keyIndex]);
                }
            } else {
                viewModel.currentSong(data);
            }
        }

        socket.on('Change Song', function (song) {
            var songData = JSON.parse(song);
            songData.viewMode = true;
            viewModel.song(songData);
            viewModel.songViewModel.originalKey('');
            viewModel.songViewModel.originalKey(songData.key);
            viewModel.songViewModel.updateSong(songData);
        });

        ko.applyBindings(viewModel);
    });
})();
