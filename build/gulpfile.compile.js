/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

const gulp = require('gulp');
const { compileTask } = require("./compilation");

// Full compile, including nls and inline sources in sourcemaps, for build

function rimrafBuild() {
	const rimraf = require("rimraf");
	rimraf('out-build');
}

gulp.task("compileBuildTask", function () {
	return compileTask('src', 'out-build')
});

gulp.task("copyBuildFile", function () {
    return gulp.src([
        'src/**/*', //Include All files
        '!src/**/*.ts', //It will exclude typescript files
        '!src/**/*.tsx'        
    ]).pipe(gulp.dest('out-build'));
});


gulp.task('compile-build', gulp.series(rimrafBuild, "compileBuildTask"));

