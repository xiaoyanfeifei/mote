const path = require("path");
const gulp = require("gulp");

function compileTask(src, out) {
    const ts = require("gulp-typescript");
    const projectPath = path.join(__dirname, '../', src, 'tsconfig.json');
    const tsProject = ts.createProject(projectPath, {
        allowJs: true,
        isolatedModules: true
    });
    
    return gulp.src("src/**/*.ts*", {since: gulp.lastRun("compile")})
        .pipe(tsProject())
        .pipe(gulp.dest(out));
}

exports.compileTask = compileTask;