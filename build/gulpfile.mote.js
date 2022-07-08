const path = require('path');
const gulp = require("gulp");
const es = require('event-stream');
const fs = require('fs');
const rimraf = require("rimraf");
const filter = require('gulp-filter');
const vfs = require('vinyl-fs');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const _ = require('underscore');
const crypto = require('crypto');
const buildfile = require('../src/buildfile');
const compilation = require("./compilation");
const createAsar = require('./lib/asar').createAsar;
const { getProductionDependencies } = require('./lib/dependencies');
const util = require("./lib/util");
const packageJson = require('../package.json');
const product = require('../product.json');
const root = path.dirname(__dirname);
const commit = util.getVersion(root);

// Build
const moteEntryPoints = _.flatten([
	buildfile.entrypoint('mote/workbench/workbench.desktop.main'),
	buildfile.code
]);

const moteResources = [
	'out-build/main.js',
	'out-build/cli.js',
	'out-build/bootstrap.js',
	'out-build/bootstrap-fork.js',
	'out-build/bootstrap-amd.js',
	'out-build/bootstrap-node.js',
	'out-build/bootstrap-window.js',
	'out-build/vs/**/*.{svg,png,html,jpg,opus}',
    'out-build/mote/**/*.{svg,png,html,jpg,opus}',
	'!out-build/mote/app/browser/**/*.html',
	'!out-build/vs/editor/standalone/**/*.svg',
	'out-build/vs/base/common/performance.js',
	'out-build/vs/base/common/stripComments.js',
	'out-build/vs/base/node/languagePacks.js',
	'out-build/vs/base/node/{stdForkStart.js,terminateProcess.sh,cpuUsage.sh,ps.sh}',
	'out-build/vs/base/browser/ui/codicons/codicon/**',
	'out-build/vs/base/parts/sandbox/electron-browser/preload.js',
	'out-build/vs/platform/environment/node/userDataPath.js',
	'out-build/vs/workbench/browser/media/*-theme.css',
	'out-build/mote/app/electron-browser/workbench/**',
	'!**/test/**'
];

/**
 * Compute checksums for some files.
 *
 * @param {string} out The out folder to read the file from.
 * @param {string[]} filenames The paths to compute a checksum for.
 * @return {Object} A map of paths to checksums.
 */
 function computeChecksums(out, filenames) {
	const result = {};
	filenames.forEach(function (filename) {
		const fullPath = path.join(process.cwd(), out, filename);
		result[filename] = computeChecksum(fullPath);
	});
	return result;
}

/**
 * Compute checksum for a file.
 *
 * @param {string} filename The absolute path to a filename.
 * @return {string} The checksum for `filename`.
 */
function computeChecksum(filename) {
	const contents = fs.readFileSync(filename);

	const hash = crypto
		.createHash('md5')
		.update(contents)
		.digest('base64')
		.replace(/=+$/, '');

	return hash;
}


function packageTask(platform, arch, sourceFolderName, destinationFolderName, opts) {
	opts = opts || {};

	const destination = path.join(path.dirname(root), destinationFolderName);
	console.log("destination", destination);
	platform = platform || process.platform;

	return () => {
		const electron = require('gulp-atom-electron');
		const json = require('gulp-json-editor');

		const out = sourceFolderName;

		const checksums = computeChecksums(out, [
			'vs/base/parts/sandbox/electron-browser/preload.js',
			'mote/workbench/workbench.desktop.main.js',
			//'vs/workbench/workbench.desktop.main.css',
			//'vs/workbench/api/node/extensionHostProcess.js',
			'mote/app/electron-browser/workbench/workbench.html',
			'mote/app/electron-browser/workbench/workbench.js'
		]);

		const src = gulp.src(out + '/**', { base: '.' })
			.pipe(rename(function (path) { path.dirname = path.dirname.replace(new RegExp('^' + out), 'out'); }))
			.pipe(util.setExecutableBit(['**/*.sh']));

		const sources = es.merge(src)
			.pipe(filter(['**', '!**/*.js.map'], { dot: true }));

		let version = packageJson.version;
		const quality = product.quality;

		if (quality && quality !== 'stable') {
			version += '-' + quality;
		}

		const name = product.nameShort;
		const packageJsonUpdates = { name, version };

		// for linux url handling
		if (platform === 'linux') {
			packageJsonUpdates.desktopName = `${product.applicationName}-url-handler.desktop`;
		}

		const packageJsonStream = gulp.src(['package.json'], { base: '.' })
			.pipe(json(packageJsonUpdates));

		const date = new Date().toISOString();
		const productJsonUpdate = { commit, date, checksums };

		const productJsonStream = gulp.src(['product.json'], { base: '.' })
		.pipe(json(productJsonUpdate));

		const jsFilter = util.filter(data => !data.isDirectory() && /\.js$/.test(data.path));
		const root = path.resolve(path.join(__dirname, '..'));
		const productionDependencies = getProductionDependencies(root);
		const dependenciesSrc = _.flatten(productionDependencies.map(d => path.relative(root, d.path)).map(d => [`${d}/**`, `!${d}/**/{test,tests}/**`]));

		const config = { version: "18.3.5"};
		const deps = gulp.src(dependenciesSrc, { base: '.', dot: true })
			.pipe(filter(['**', `!**/${config.version}/**`, '!**/bin/darwin-arm64-87/**', '!**/package-lock.json', '!**/yarn.lock', '!**/*.js.map']))
			.pipe(util.cleanNodeModules(path.join(__dirname, '.moduleignore')))
			.pipe(jsFilter)
			//.pipe(util.rewriteSourceMappingURL(sourceMappingURLBase))
			.pipe(jsFilter.restore)
			.pipe(createAsar(path.join(process.cwd(), 'node_modules'), [
				'**/*.node',
				'**/@vscode/ripgrep/bin/*',
				'**/node-pty/build/Release/*',
				'**/node-pty/lib/worker/conoutSocketWorker.js',
				'**/node-pty/lib/shared/conout.js',
				'**/*.wasm',
			], 'node_modules.asar'));

		let all = es.merge(
			packageJsonStream,
			productJsonStream,
			sources,
			deps
		);

		if (platform === 'win32') {
			all = es.merge(all, gulp.src([
				'resources/win32/bower.ico',
				'resources/win32/c.ico',
				'resources/win32/config.ico',
				'resources/win32/cpp.ico',
				'resources/win32/csharp.ico',
				'resources/win32/css.ico',
				'resources/win32/default.ico',
				'resources/win32/go.ico',
				'resources/win32/html.ico',
				'resources/win32/jade.ico',
				'resources/win32/java.ico',
				'resources/win32/javascript.ico',
				'resources/win32/json.ico',
				'resources/win32/less.ico',
				'resources/win32/markdown.ico',
				'resources/win32/php.ico',
				'resources/win32/powershell.ico',
				'resources/win32/python.ico',
				'resources/win32/react.ico',
				'resources/win32/ruby.ico',
				'resources/win32/sass.ico',
				'resources/win32/shell.ico',
				'resources/win32/sql.ico',
				'resources/win32/typescript.ico',
				'resources/win32/vue.ico',
				'resources/win32/xml.ico',
				'resources/win32/yaml.ico',
				'resources/win32/code_70x70.png',
				'resources/win32/code_150x150.png'
			], { base: '.' }));
		} else if (platform === 'linux') {
			all = es.merge(all, gulp.src('resources/linux/code.png', { base: '.' }));
		} else if (platform === 'darwin') {
			const shortcut = gulp.src('resources/darwin/bin/code.sh')
				.pipe(replace('@@APPNAME@@', product.applicationName))
				.pipe(rename('bin/code'));

			all = es.merge(all, shortcut);
		}

		let result = all
			.pipe(util.skipDirectories())
			.pipe(util.fixWin32DirectoryPermissions())
			.pipe(filter(['**', '!**/.github/**'], { dot: true })) // https://github.com/microsoft/vscode/issues/116523
			.pipe(electron(_.extend({}, config, { platform, arch: arch === 'armhf' ? 'arm' : arch, ffmpegChromium: true })))
			.pipe(filter(['**', '!LICENSE', '!LICENSES.chromium.html', '!version'], { dot: true }));

		if (platform === 'linux') {
			result = es.merge(result, gulp.src('resources/completions/bash/code', { base: '.' })
				.pipe(replace('@@APPNAME@@', product.applicationName))
				.pipe(rename(function (f) { f.basename = product.applicationName; })));

			result = es.merge(result, gulp.src('resources/completions/zsh/_code', { base: '.' })
				.pipe(replace('@@APPNAME@@', product.applicationName))
				.pipe(rename(function (f) { f.basename = '_' + product.applicationName; })));
		}

		if (platform === 'win32') {
			result = es.merge(result, gulp.src('resources/win32/bin/code.js', { base: 'resources/win32', allowEmpty: true }));

			result = es.merge(result, gulp.src('resources/win32/bin/code.cmd', { base: 'resources/win32' })
				.pipe(replace('@@NAME@@', product.nameShort))
				.pipe(rename(function (f) { f.basename = product.applicationName; })));

			result = es.merge(result, gulp.src('resources/win32/bin/code.sh', { base: 'resources/win32' })
				.pipe(replace('@@NAME@@', product.nameShort))
				.pipe(replace('@@PRODNAME@@', product.nameLong))
				.pipe(replace('@@VERSION@@', version))
				//.pipe(replace('@@COMMIT@@', commit))
				.pipe(replace('@@APPNAME@@', product.applicationName))
				.pipe(replace('@@SERVERDATAFOLDER@@', product.serverDataFolderName || '.vscode-remote'))
				.pipe(replace('@@QUALITY@@', quality))
				.pipe(rename(function (f) { f.basename = product.applicationName; f.extname = ''; })));

			result = es.merge(result, gulp.src('resources/win32/VisualElementsManifest.xml', { base: 'resources/win32' })
				.pipe(rename(product.nameShort + '.VisualElementsManifest.xml')));

			result = es.merge(result, gulp.src('.build/policies/win32/**', { base: '.build/policies/win32' })
				.pipe(rename(f => f.dirname = `policies/${f.dirname}`)));

		} else if (platform === 'linux') {
			result = es.merge(result, gulp.src('resources/linux/bin/code.sh', { base: '.' })
				.pipe(replace('@@PRODNAME@@', product.nameLong))
				.pipe(replace('@@APPNAME@@', product.applicationName))
				.pipe(rename('bin/' + product.applicationName)));
		}

		return result.pipe(vfs.dest(destination));
	};
}

const buildRoot = path.dirname(root);


const BUILD_TARGETS = [
	{ platform: 'win32', arch: 'ia32' },
	{ platform: 'win32', arch: 'x64' },
	{ platform: 'win32', arch: 'arm64' },
	{ platform: 'darwin', arch: 'x64', opts: { stats: true } },
	{ platform: 'darwin', arch: 'arm64', opts: { stats: true } },
	{ platform: 'linux', arch: 'ia32' },
	{ platform: 'linux', arch: 'x64' },
	{ platform: 'linux', arch: 'armhf' },
	{ platform: 'linux', arch: 'arm64' },
];

BUILD_TARGETS.forEach(buildTarget => {
	const dashed = (str) => (str ? `-${str}` : ``);
	const platform = buildTarget.platform;
	const arch = buildTarget.arch;
	const opts = buildTarget.opts;

	const [mote, moteMin] = [''].map(minified => {
		const sourceFolderName = `out-build${dashed(minified)}`;
		const destinationFolderName = `Mote${dashed(platform)}${dashed(arch)}`;

        const moteTaskCI = `mote${dashed(platform)}${dashed(arch)}${dashed(minified)}-ci`;
        const motePackageTask = `mote${dashed(platform)}${dashed(arch)}${dashed(minified)}-package`;
		const rimrafTask = (cb) => {
			rimraf(path.join(buildRoot, destinationFolderName), cb);
		}
		const packageTarget = () => {
			return packageTask(platform, arch, sourceFolderName, destinationFolderName, opts)()
		}
        gulp.task(motePackageTask, packageTarget);
	
		gulp.task(moteTaskCI, gulp.series(
			rimrafTask,
			motePackageTask
		));

        const moteTask = `mote${dashed(platform)}${dashed(arch)}${dashed(minified)}`;
		gulp.task(moteTask, gulp.series(
			"copyBuildFile",
			"compileBuildTask",
			//minified ? minifyVSCodeTask : optimizeVSCodeTask,
			moteTaskCI
		));

		return moteTask;
	});

	if (process.platform === platform && process.arch === arch) {
		gulp.task('mote', gulp.series(mote));
		//gulp.task('mote-min', gulp.series(moteMin));
	}
});