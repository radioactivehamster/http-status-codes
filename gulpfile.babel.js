'use strict';

var browserSync = require('browser-sync').create();
var colorguard  = require('gulp-colorguard');
var csscomb     = require('gulp-csscomb');
var dateTime    = require('@radioactivehamster/date-time');
var fs          = require('fs');
var gulp        = require('gulp');
var htmltidy    = require('gulp-htmltidy');
var less        = require('gulp-less');
var pkg         = require('./package.json');
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

gulp.task('font', () => {
    return gulp.src('node_modules/font-awesome/fonts/**.*')
        .pipe(gulp.dest('asset/font'));
});

gulp.task('serve', ['data', 'style', 'template'], () => {
    browserSync.init({ open: false, server: { baseDir: './' } });
    gulp.watch('src/style/*.less', ['style']).on('change', browserSync.reload);
    gulp.watch('src/template/*.hbs', ['template']).on('change', browserSync.reload);
});

gulp.task('style', ['font'], () => {
    return gulp.src('src/style/main.less')
        .pipe(less())
        .pipe(csscomb())
        .pipe(colorguard().on('error', e => console.warn(e.message)))
        .pipe(gulp.dest('asset/stylesheet'));
});

gulp.task('template', () => {
    /**
     * Remove angle bracket enclosed email addresses.
     * @todo Look into potential "safe string" encoding issues in `stachio`.
     */
    let author      = pkg.author.replace(/ <.+>/i, '');
    let cname       = 'www.radioactivehamster.com';
    let htmltidyrc  = yaml.load(fs.readFileSync('./.htmltidyrc').toString());
    let radix       = 10;
    let statusData  = require('./data/http-status-codes.json');
    let statusCodes = [];

    Object.keys(statusData).forEach(classValue => {
        let status        = statusData[classValue];
        let classStatuses = status['status-codes'];

        Object.keys(classStatuses).forEach(statusCodeValue => {
            let statusCode = classStatuses[statusCodeValue];

            statusCodes.push({
                statusCodeValue: parseInt(statusCodeValue, radix),
                reasonPhrase: statusCode['reason-phrase']
            });
        });
    });

    return gulp.src('src/template/*.hbs')
        .pipe(stachio({
            author: author,
            cname: cname,
            statusCodes: statusCodes,
            timestamp: dateTime()
        }))
        .pipe(htmltidy(htmltidyrc))
        .pipe(gulp.dest('./'));
});

gulp.task('default', ['data', 'font', 'style', 'template']);
