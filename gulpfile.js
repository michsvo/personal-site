// Settings
var settings = {
	clean: true,
	scripts: true,
	styles: true,
	svgs: true,
	reload: true
};

// File paths
var paths = {
	input: 'app/',
	output: 'dist/',

	scripts: {
		input: 'app/js/*',
		output: 'dist/scripts/'
	},
	styles: {
		input: 'app/scss/**/*.{scss,sass}',
		output: 'dist/styles/'
	},
	svgs: {
		input: 'app/assets/svg/*.svg',
		output: 'dist/images/'
	},
	reload: './dist/'
};

// Gulp Packages

// General
var {gulp, src, dest, watch, series, parallel} = require('gulp');
var del = require('del');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');

// Scripts
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

// Styles
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var prefix = require('autoprefixer');
var minify = require('cssnano');

// SVGs
var svgmin = require('gulp-svgmin');

// BrowserSync
var browserSync = require('browser-sync');

// Gulp Tasks

// Remove pre-existing content from output folders
var cleanDist = function (done) {
	if (!settings.clean) return done();
    del.sync([
		  paths.output
	  ]);
  return done();
};

// JS task
var buildScripts = function (done) {
  if (!settings.styles) return done();
  return src(paths.scripts.input)
    .pipe(concat('scripts.js'))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(dest('dist/scripts')
    );
}

// Sass task
var buildStyles = function (done) {
  if (!settings.styles) return done();
	return src(paths.styles.input)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(postcss([ prefix(), minify() ]))
    .pipe(sourcemaps.write('.'))
    .pipe(rename({suffix: '.min'}))
    .pipe(dest('dist/styles')
    );
}

// Optimize SVG
var buildSVGs = function (done) {
	if (!settings.svgs) return done();
	return src(paths.svgs.input)
		.pipe(svgmin())
		.pipe(dest(paths.svgs.output));
};

// Watch task
var startServer = function (done) {
	if (!settings.reload) return done();

	browserSync.init({
		server: {
			baseDir: './'
		}
	});
	done();
};

// Reload the browser
var reloadBrowser = function (done) {
	if (!settings.reload) return done();
	  browserSync.reload();
	  done();
};

// Watch for changes
var watchSource = function (done) {
	watch(paths.input, series(exports.default, reloadBrowser));
	done();
};

//Export Tasks

// Default task
exports.default = series(
	cleanDist,
	parallel(
		buildScripts,
		buildStyles,
		buildSVGs,
	)
);

// Watch and reload task
exports.watch = series(
	exports.default,
	startServer,
	watchSource,
);
