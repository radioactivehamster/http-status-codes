'use strict';


var browserSync = require('browser-sync').create();
var fs          = require('fs');
var gulp        = require('gulp');
var less        = require('gulp-less');
var stachio     = require('gulp-stachio');

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
      .pipe(gulp.dest('asset/stylesheet'));
});

gulp.task('template', () => {
    return gulp.src('src/template/*.hbs')
      .pipe(stachio())
      .pipe(gulp.dest('./'));
});

gulp.task('default', ['data', 'style', 'template']);
