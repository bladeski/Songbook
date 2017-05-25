var gulp = require('gulp'),
    run = require('gulp-run'),
    del = require('del'),
    install = require('gulp-install'),
    nodeModulePath = './node_modules/',
    libPath = './src/public/lib/';

gulp.task('clean', function () {
    return del(['src/public/lib/*']);
});

gulp.task('build', ['clean'], function () {
    var dependencies = [{
        name: 'Knockout.js',
        dir: 'knockout',
        paths: ['knockout/build/output/knockout-latest.js']
    }, {
        name: 'Bootstrap',
        dir: 'bootstrap',
        paths: ['bootstrap/dist/css/bootstrap.min*', 'bootstrap/dist/js/bootstrap.min*']
    }, {
        name: 'Font Awesome CSS',
        dir: 'font-awesome/css',
        paths: ['font-awesome/css/*']
    }, {
        name: 'Font Awesome Fonts',
        dir: 'font-awesome/fonts',
        paths: ['font-awesome/fonts/*']
    }, {
        name: 'Require JS',
        dir: 'requirejs',
        paths: ['requirejs/require.js']
    }, {
        name: 'jQuery',
        dir: 'jquery',
        paths: ['jquery/dist/jquery.min.js']
    }, {
        name: 'Perfect Scrollbar JS',
        dir: 'perfect-scrollbar/js',
        paths: ['perfect-scrollbar/dist/js/perfect-scrollbar.min.js']
    }, {
        name: 'Perfect Scrollbar CSS',
        dir: 'perfect-scrollbar/css',
        paths: ['perfect-scrollbar/dist/css/perfect-scrollbar.min.css']
    }, {
        name: 'Socket.IO Client',
        dir: 'socket.io',
        paths: ['socket.io-client/dist/socket.io.js']
    }];

    dependencies.forEach(function (dep) {
        dep.paths.forEach(function (path) {
            return gulp.src(nodeModulePath + path).pipe(gulp.dest(libPath + dep.dir));
        });
    });
});

gulp.task('run', ['build'], function () {
    return run('set DEBUG=app:* & npm start').exec();
});
