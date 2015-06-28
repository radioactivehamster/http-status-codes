'use strict';

var browserSync = require('browser-sync').create();
var csscomb     = require('gulp-csscomb');
var fs          = require('fs');
var gulp        = require('gulp');
var htmltidy    = require('gulp-htmltidy');
var less        = require('gulp-less');
var stachio     = require('gulp-stachio');
var yaml        = require('js-yaml');

gulp.task('data', () => {
    return fs.mkdir('data', () => {
        try {
            fs.renameSync('http-status-codes.json', 'data/http-status-codes.json');
        } catch (_e) {}

        try {
            fs.renameSync('http-status-codes.yml', 'data/http-status-codes.yml');
        } catch (_e) {}
    });
});

gulp.task('serve', ['data', 'style', 'template'], () => {
    browserSync.init({ open: false, server: { baseDir: './' } });
    gulp.watch('src/style/*.less', ['style']).on('change', browserSync.reload);
    gulp.watch('src/template/*.hbs', ['template']).on('change', browserSync.reload);
});

gulp.task('style', () => {
    return gulp.src('src/style/main.less')
        .pipe(less())
        .pipe(csscomb())
        .pipe(gulp.dest('asset/stylesheet'));
});

gulp.task('template', () => {
    let cname      = 'www.radioactivehamster.com';
    let htmltidyrc = yaml.load(fs.readFileSync('./.htmltidyrc').toString());

    return gulp.src('src/template/*.hbs')
        .pipe(stachio({ cname: cname }))
        .pipe(htmltidy(htmltidyrc))
        .pipe(gulp.dest('./'));
});

gulp.task('default', ['data', 'style', 'template']);
