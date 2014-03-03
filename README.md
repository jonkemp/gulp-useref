# [gulp](https://github.com/wearefractal/gulp)-useref [![Build Status](https://travis-ci.org/jonkemp/gulp-useref.png?branch=master)](https://travis-ci.org/jonkemp/gulp-useref)

> Parse build blocks in HTML files to replace references to non-optimized scripts or stylesheets with [useref](https://github.com/digisfera/useref)

A [gulp](https://github.com/wearefractal/gulp) style implementation of _useref_ inspired by the [grunt-useref](https://github.com/pajtai/grunt-useref) task. In true _gulp_ style, this plugin tries to focus on performing just one task on your stream, so  it does not perform minification of assets. You can use [gulp-filter](https://github.com/sindresorhus/gulp-filter) alongside minification plugins such as [gulp-uglify](https://github.com/terinjokes/gulp-uglify), [gulp-minify-css](https://github.com/jonathanepollack/gulp-minify-css) or others.


## Install

Install with [npm](https://npmjs.org/package/gulp-useref)

```
npm install --save-dev gulp-useref
```


## Usage

```js
var gulp = require('gulp');
var useref = require('gulp-useref');

gulp.task('default', function() {
	return gulp.src('./*.html')
        .pipe(useref())
        .pipe(gulp.dest('build'));
});
```

You can use gulp-useref by itself to process build blocks in HTML files. The build block syntax is `build:type id`. Valid types are `js` and `css`.

    <html>
    <head>
        <!-- build:css css/combined.css -->
        <link href="css/one.css" rel="stylesheet">
        <link href="css/two.css" rel="stylesheet">
        <!-- endbuild -->
    </head>
    <body>
        <!-- build:js scripts/combined.js -->
        <script type="text/javascript" src="scripts/one.js"></script>
        <script type="text/javascript" src="scripts/two.js"></script>
        <!-- endbuild -->
    </body>
    </html>


The resulting HTML would be:

    <html>
    <head>
        <link rel="stylesheet" href="css/combined.css"/>
    </head>
    <body>
        <script src="scripts/combined.js"></script>
    </body>
    </html>


To access the assets to perform minification, you can call `references` on the useref stream. For instance:

```js
var gulp = require('gulp'),
var useref = require('gulp-useref');
var filter = require('gulp-filter');

gulp.task('default', function() {
    var refBlocks = useref();
    var jsFilter = filter('**/*.js');
    var cssFilter = filter('**/*.css');

    return gulp.src('./*.html')
        .pipe(refBlocks)
        .pipe(gulp.dest('build')) // write out html files with build blocks processed
        .pipe(refBlocks.references()) // work with references (only .js and .css files)
        .pipe(jsFilter)
        .pipe(uglify())
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe(minifyCss())
        .pipe(cssFilter.restore())
        .pipe(gulp.dest('dist')) // save out all .js and .css files
        .pipe(refBlocks); // if required, we can revert to working with the html files again
});
```


## License

MIT &copy; [Jonathan Kemp](http://jonkemp.com)
