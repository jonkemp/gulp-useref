# [gulp](https://github.com/wearefractal/gulp)-useref [![Build Status](https://travis-ci.org/jonkemp/gulp-useref.png?branch=master)](https://travis-ci.org/jonkemp/gulp-useref)

> Parse build blocks in HTML files to replace references to non-optimized scripts or stylesheets with [useref](https://github.com/digisfera/useref)

Inspired by the grunt plugin [grunt-useref](https://github.com/pajtai/grunt-useref). It will do file concatenation but not minification. Files are then passed down as part of the stream. For minification of assets or other modifications, use [gulp-filter](https://github.com/sindresorhus/gulp-filter) to filter specific types of assets.


## Install

Install with [npm](https://npmjs.org/package/gulp-useref)

```
npm install --save-dev gulp-useref
```


## Usage

The following example will parse the build blocks in the HTML, replace them and pass those files through. Assets inside the build blocks will be concatenated and passed through as well.

```js
var gulp = require('gulp'),
    useref = require('gulp-useref');

gulp.task('default', function () {
	return gulp.src('app/*.html')
        .pipe(useref())
        .pipe(gulp.dest('dist'));
});
```

If you want to minify your assets or perform some other modification, you can use [gulp-filter](https://github.com/sindresorhus/gulp-filter) to handle specific types of assets. When you want all the original files back, just call the restore method.

```js
var gulp = require('gulp'),
    useref = require('gulp-useref'),
    filter = require('gulp-filter'),
    uglify = require('gulp-uglify'),
    minifyCss = require('gulp-minify-css');

gulp.task('html', function () {
    var jsFilter = filter('**/*.js');
    var cssFilter = filter('**/*.css');

    return gulp.src('app/*.html')
        .pipe(useref())
        .pipe(jsFilter)
        .pipe(uglify())
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe(minifyCss())
        .pipe(cssFilter.restore())
        .pipe(gulp.dest('dist'));
});
```


The build block syntax is `build:type id`. Valid types are `js` and `css`.

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


## License

MIT © [Jonathan Kemp](http://jonkemp.com)
