define(['knockout', 'perfect-scrollbar'], function (ko, perfectScrollbar) {
    var menuViewModel = {
        songList: ko.observableArray(),
        isExpanded: ko.observable(false),
        menuContainer: null
    };

    menuViewModel.initialiseMenu = function (container, callback) {
        menuViewModel.menuContainer = container;

        perfectScrollbar.initialize(container, {
            suppressScrollX: true
        });

        $.ajax({
            url: '/data/songList.json'
        }).done(function(data) {
            var songList = data.sort(function (a,b) {
                    return a.songTitle > b.songTitle ? 1 : a.songTitle < b.songTitle ? -1 : 0;
                }),
                groupedList = [];

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

            menuViewModel.songList(groupedList);
            perfectScrollbar.update(menuViewModel.menuContainer);

            callback && callback(songList);
        });
    }

    menuViewModel.toggleMenu = function () {
        document.getElementById('menu').classList.toggle('expand');
        document.getElementById('song-section').classList.toggle('menu-expand');
    }

    menuViewModel.toggleLetter = function (data) {
        data.expanded(!data.expanded());
        perfectScrollbar.update(menuViewModel.menuContainer);
    }

    return menuViewModel;
});
