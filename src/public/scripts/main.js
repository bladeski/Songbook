(function() {
    'use strict';

    require.config({
        shim : {
            bootstrap : { deps :['jquery'] }
        },
        paths: {
            jquery: '/lib/jquery/jquery.min',
            bootstrap: '/lib/bootstrap/bootstrap.min',
            knockout: '/lib/knockout/knockout-latest',
            'perfect-scrollbar': '/lib/perfect-scrollbar/js/perfect-scrollbar.min',
            'socket.io': '/lib/socket.io/socket.io',
            songViewModel: '/scripts/viewModels/songViewModel'
        }
    });

    requirejs([
        'jquery',
        'knockout',
        'bootstrap',
        'perfect-scrollbar',
        'socket.io',
        'songViewModel'
    ], function($, ko, bootstrap, perfectScrollbar, io, songViewModel) {

        var viewModel = {
                songViewModel: songViewModel,
                currentSong: ko.observable(),
                song: ko.observable(),
                songOptions: ko.observableArray()
            },
            menuContainer = document.getElementsByClassName('songlist')[0],
            socket = io();

        viewModel.songViewModel.setDOMContainerById('song');

        perfectScrollbar.initialize(menuContainer, {
            suppressScrollX: true
        });

        function getQueryStringValue (key) {
            return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
        }



        // function highlightChorus (song) {
        //     return song.replace(/{soc}/g, '<div class="song-chorus">').replace(/{eoc}/g, '</div>');
        // }



        viewModel.currentSong.subscribe(function (newValue) {
            $.ajax({
                url: '/song?name=' + newValue.url
            }).done(function(data) {
                viewModel.song(data);

                var song = {
                        songTitle: data.title,
                        songSubTitle: data.subtitle,
                        formattedSong: data.song,
                        key: data.key
                    };

                viewModel.songViewModel.updateSong(song);

                setTimeout(function () {
                    var chords = viewModel.songViewModel.songDOMContainer.getElementsByClassName('chord');

                    for (var i = 0; i < (chords.length - 1); i++) {
                        viewModel.songViewModel.spaceChord(chords[i], chords[i + 1]);
                    }
                }, 0);
            });
        });

        viewModel.toggleMenu = function () {
            document.getElementById('menu').classList.toggle('expand');
            document.getElementById('song-section').classList.toggle('menu-expand');
        }

        viewModel.toggleLetter = function (data) {
            data.expanded(!data.expanded());
            perfectScrollbar.update(menuContainer);
        }

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
        }

        viewModel.changeSong = function (data) {

            socket.emit('Director Change Song', data);
            viewModel.selectSong(data);
        }

        // viewModel.songViewModel.key.subscribe(function (newValue) {
        //     var data = viewModel.currentSong();
        //     if (data) {
        //         data.key = newValue;
        //         socket.emit('Director Change Song', data);
        //     }
        // });

        ko.applyBindings(viewModel);

        $.ajax({
            url: '/data/songList.json'
        }).done(function(data) {
            var songList = data.sort(function (a,b) {
                    return a.songTitle > b.songTitle ? 1 : a.songTitle < b.songTitle ? -1 : 0;
                }),
                groupedList = [],
                songName = getQueryStringValue('name');

            songList.forEach(function (song) {
                var letter = song.songTitle.substr(0, 1).toUpperCase();

                var group = groupedList.find(function (group) {
                    return group.letter === letter;
                });

                if (group) {
                    group.songs.push(song);
                } else {
                    groupedList.push({
                        expanded: ko.observable(false),
                        letter: letter,
                        songs: [song]
                    });
                }
            });

            if (window.location.pathname === '/song' && songName) {
                var currentSong = songList.find(function (song) {
                    return song.songTitle === songName;
                });

                if (currentSong) {
                    viewModel.selectSong(currentSong);
                } else {
                    viewModel.toggleMenu();
                }
            } else {
                viewModel.toggleMenu();
            }

            viewModel.songOptions(groupedList);

            perfectScrollbar.update(menuContainer);

            socket.on('Change Song', function (song) {
                viewModel.selectSong(song);
            });
        });
    });
})();
