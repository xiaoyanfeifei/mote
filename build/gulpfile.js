const gulp = require("gulp");
const path = require("path");

function createCompile(src) {
	const ts = require("gulp-typescript");
    const projectPath = path.join(__dirname, '../', src, 'tsconfig.json');
    const tsProject = ts.createProject(projectPath, {
        allowJs: true,
        isolatedModules: true
    });
    return tsProject;
}
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
    const compilation = createCompile("src");
    return compilation.src().pipe(compilation()).js.pipe(gulp.dest("out"));
});

gulp.task("build", gulp.series("rimraf", "copyFile", "compile"));

gulp.task("watch", function() {
    gulp.watch("src/**/*", {ignoreInitial: false}, gulp.series("copyFile","compile"))
})