const gulp = require("gulp");
const path = require("path");

const { compileTask } = require("./lib/compilation");

gulp.task("rimraf", function (cb) {
    const rimraf = require("rimraf");
    rimraf("out", cb);
});

gulp.task("copyFile", function () {
    return gulp.src([
        'src/**/*', //Include All files
        '!src/**/*.ts', //It will exclude typescript files
        '!src/**/*.tsx'        
    ]).pipe(gulp.dest('out'));
});

gulp.task("compile", function () {
    return compileTask("src", "out");
});

gulp.task("build", gulp.series("rimraf", "copyFile", "compile"));

gulp.task("watch", function() {
    gulp.watch("src/**/*", {ignoreInitial: false}, gulp.series("copyFile","compile"))
});


// Load all the gulpfiles only if running tasks other than the editor tasks
require('glob').sync('gulpfile.*.js', { cwd: __dirname })
	.forEach(f => require(`./${f}`));
    