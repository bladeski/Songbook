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
        index: '/scripts/index',
        musician: '/scripts/musician',
        songViewModel: '/scripts/viewModels/songViewModel',
        menuViewModel: '/scripts/viewModels/menuViewModel'
    }
});
