var gulp = require('gulp');
var git = require('gulp-git');
var bump = require('gulp-bump');
var argv = require('yargs').argv;

gulp.task('bump', function() {
    return gulp.src('./package.json')
        .pipe(bump({ type: argv.type }))
        .pipe(gulp.dest('./'));
});

gulp.task('tag', function() {
    var pkg = require('./package.json');
    var v = 'v' + pkg.version;
    var message = 'Release ' + v;

    return gulp.src('./')
        .pipe(git.commit(message))
        .pipe(git.tag(v, message))
        .pipe(git.push('origin', 'master', '--tags'))
        .pipe(gulp.dest('./'));
});
