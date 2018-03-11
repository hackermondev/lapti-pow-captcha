var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    watch = require('gulp-watch'),

    sources = [
        'node_modules/js-sha3/build/sha3.min.js',
        'src/captcha.js'
    ];

gulp.task('build', function () {
    gulp.src(sources)
        .pipe(uglify())
        .pipe(concat('lapti-pow-captcha.min.js'))
        .pipe(gulp.dest('build'));
});

gulp.task('watch', function () {
    gulp.watch('src/**/*.js', ['build']);
});

gulp.task('default', ['build', 'watch']);
