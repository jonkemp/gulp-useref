# [gulp](https://github.com/gulpjs/gulp)-useref [![Build Status](https://travis-ci.org/jonkemp/gulp-useref.png?branch=master)](https://travis-ci.org/jonkemp/gulp-useref)

> Parse build blocks in HTML files to replace references to non-optimized scripts or stylesheets with [useref](https://github.com/digisfera/useref)

Inspired by the grunt plugin [grunt-useref](https://github.com/pajtai/grunt-useref). It can handle file concatenation but not minification. Files are then passed down the stream. For minification of assets or other modifications, use [gulp-filter](https://github.com/sindresorhus/gulp-filter) to filter specific types of assets.


## Install

Install with [npm](https://npmjs.org/package/gulp-useref)

```
npm install --save-dev gulp-useref
```


## Usage

The following example will parse the build blocks in the HTML, replace them and pass those files through. Assets inside the build blocks will be concatenated and passed through in a stream as well.

```js
var gulp = require('gulp'),
    useref = require('gulp-useref');

gulp.task('default', function () {
    var assets = useref.assets();
    
	return gulp.src('app/*.html')
        .pipe(assets)
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(gulp.dest('dist'));
});
```

If you want to minify your assets or perform some other modification, you can use [gulp-if](https://github.com/robrich/gulp-if) to conditionally handle specific types of assets.

```js
var gulp = require('gulp'),
    useref = require('gulp-useref'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    minifyCss = require('gulp-minify-css');

gulp.task('html', function () {
    var assets = useref.assets();
    
    return gulp.src('app/*.html')
        .pipe(assets)
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', minifyCss()))
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(gulp.dest('dist'));
});
```


Blocks are expressed as:

```html
<!-- build:<type>(alternate search path) <path> -->
... HTML Markup, list of script / link tags.
<!-- endbuild -->
```

- **type**: either `js`, `css` or `remove`; `remove` will remove the build block entirely without generating a file
- **alternate search path**: (optional) By default the input files are relative to the treated file. Alternate search path allows one to change that
- **path**: the file path of the optimized file, the target output

An example of this in completed form can be seen below:

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

## API

### useref.assets(options)

Returns a stream with the concatenated asset files from the build blocks inside the HTML.

#### options.searchPath

Type: `String` or `Array`  
Default: `none`  

Specify the location to search for asset files, relative to the current working directory. Can be a string or array of strings.

### stream.restore()

Brings back the previously filtered out HTML files.


## Notes

* [ClosureCompiler.js](https://github.com/dcodeIO/ClosureCompiler.js) doesn't support Buffers, which means if you want to use [gulp-closure-compiler](https://github.com/sindresorhus/gulp-closure-compiler) you'll have to first write out the `combined.js` to disk. See [this](https://github.com/dcodeIO/ClosureCompiler.js/issues/11) for more information.

## Acknowledgments

* Whitney Young ([@wbyoung](https://github.com/wbyoung)) for suggesting a separate stream for assets and the use of [gulp-filter](https://github.com/sindresorhus/gulp-filter) to filter assets.

## Contributing

See the [CONTRIBUTING Guidelines](https://github.com/jonkemp/gulp-useref/blob/master/CONTRIBUTING.md)

## License

MIT © [Jonathan Kemp](http://jonkemp.com)
