# PostHTML Minifier
[![npm version](https://badge.fury.io/js/htmlnano.svg)](http://badge.fury.io/js/htmlnano)
[![Build Status](https://travis-ci.org/maltsev/htmlnano.svg?branch=master)](https://travis-ci.org/maltsev/htmlnano)

Modular HTML minifier, built on top of the [PostHTML](https://github.com/posthtml/posthtml). Inspired by [cssnano](http://cssnano.co/).




## Usage

### Gulp
```
npm install --save-dev gulp-htmlnano
```

```js
var gulp = require('gulp');
var htmlnano = require('gulp-htmlnano');
var options = {
    removeComments: false
};

gulp.task('default', function() {
    return gulp
        .src('./index.html')
        .pipe(htmlnano(options))
        .pipe(gulp.dest('./build'));
});
```


### Javascript
```js
var htmlnano = require('htmlnano');
var options = {
    removeEmptyAttributes: false, // Disable the module "removeEmptyAttributes"
    collapseWhitespace: 'conservative' // Pass options to the module "collapseWhitespace"
};

htmlnano.process(html, options).then(function (result) {
    // result.html is minified
});
```


### PostHTML
Just add `htmlnano` as the last plugin:
```js
var posthtml = require('posthtml');
var options = {
    removeComments: false, // Disable the module "removeComments"
    collapseWhitespace: 'conservative' // Pass options to the module "collapseWhitespace"
};

posthtml([
    /* other PostHTML plugins */

    require('htmlnano')(options)
]).process(html).then(function (result) {
    // result.html is minified
});
```




## Modules
By default all modules are enabled. You can disable some of them by passing module name with `false`
in the plugin options (like in the usage example above).


### collapseWhitespace
Collapses redundant white spaces (including new lines). It doesn’t affect white spaces in the elements `<style>`, `<textarea>`, `<script>`, and `<pre>`.

##### Options
- `all` — collapses all redundant white spaces (default)
- `conservative` — collapses all redundant white spaces to 1 space

##### Side effects
`<i>hello</i> <i>world</i>` after minification will be rendered as `helloworld`.
To prevent that use `conservative` option.

##### Example
Source:
```html
<div>
    hello  world!
    <style>div  { color: red; }  </style>
</div>
```

Minified (with `all`):
```html
<div>hello world!<style>div  { color: red; }  </style></div>
```

Minified (with `conservative`):
```html
<div> hello world! <style>div  { color: red; }  </style> </div>
```




### removeComments
##### Options
- `safe` – removes all HTML comments except [`<!--noindex--><!--/noindex-->`](https://yandex.com/support/webmaster/controlling-robot/html.xml) (default)
- `all` — removes all HTML comments

##### Example
Source:
```html
<div><!-- test --></div>
```

Minified:
```html
<div></div>
```


### removeEmptyAttributes
Removes empty [safe-to-remove](https://github.com/maltsev/htmlnano/blob/master/lib/modules/removeEmptyAttributes.es6) attributes.

##### Example
Source:
```html
<img src="foo.jpg" alt="" style="">
```

Minified:
```html
<img src="foo.jpg" alt="">
```




### minifyCss
Minifies CSS with [cssnano](http://cssnano.co/) inside `<style>` tags and `style` attributes.

##### Options
See [the documentation of cssnano](http://cssnano.co/optimisations/).
For example you can [keep outdated vendor prefixes](http://cssnano.co/optimisations/#discard-outdated-vendor-prefixes):
```js
htmlnano.process(html, {
    minifyCss: {
        autoprefixer: false
    }
});
```

##### Example
Source:
```html
<div>
    <style>
        h1 {
            margin: 10px 10px 10px 10px;
            color: #ff0000;
        }
    </style>
</div>
```

Minified:
```html
<div>
    <style>h1{margin:10px;color:red}</style>
</div>
```




### minifyJs
Minifies JS with [UglifyJS2](https://github.com/mishoo/UglifyJS2) inside `<script>` tags.

##### Options
See [the API documentation of UglifyJS2](https://github.com/mishoo/UglifyJS2#api-reference)

##### Example
Source:
```html
<div>
    <script>
        /* comment */
        var foo = function () {

        };
    </script>
</div>
```

Minified:
```html
<div>
    <script>var foob=function(){};</script>
</div>
```




### removeRedundantAttributes
Removes redundant attributes from tags if they contain default values:
- `method="get"` from `<form>`
- `type="text"` from `<input>`
- `language="javascript"` and `type="text/javascript"` from `<script>`
- `charset` from `<script>` if it's an external script
- `media="all"` from `<style>` and `<link>`

##### Side effects
This module could break your styles or JS if you use selectors with attributes:
```CSS
form[method="get"] {
    color: red;
}
```

##### Example
Source:
```html
<form method="get">
    <input type="text">
</form>
```

Minified:
```html
<form>
    <input>
</form>
```




### collapseBooleanAttributes
Collapses boolean attributes (like `disabled`) to the minimized form.

##### Side effects
This module could break your styles or JS if you use selectors with attributes:
```CSS
button[disabled="disabled"] {
    color: red;
}
```

##### Example
Source:
```html
<button disabled="disabled">click</button>
<script defer=""></script>
```

Minified:
```html
<button disabled>click</button>
<script defer></script>
```


### custom
It's also possible to pass custom modules in the minifier.

As a function:
```js
var options = {
    custom: function (tree, options) {
        // Some minification
        return tree;
    }
};
```

Or as a list of functions:
```js
var options = {
    custom: [
        function (tree, options) {
            // Some minification
            return tree;
        },

        function (tree, options) {
            // Some other minification
            return tree;
        }
    ]
};
```

`options` is an object with all options that were passed to the plugin.




## Contribute
Since the minifier is modular, it's very easy to add new modules:

1. Create a ES6-file inside `lib/modules/` with a function that does some minification. For example you can check [`lib/modules/example.es6`](https://github.com/maltsev/htmlnano/blob/master/lib/modules/example.es6).

2. Add the module in [the modules array](https://github.com/maltsev/htmlnano/blob/master/lib/htmlnano.es6#L5). The modules are applied from top to bottom. So you can choose the order for your module.

3. Create a JS-file inside `test/modules/` with some unit-tests.

4. Describe your module in the section "[Modules](https://github.com/maltsev/htmlnano/blob/master/README.md#modules)".

5. Send me a pull request.


Other types of contribution (bug fixes, documentation improves, etc) are also welcome!
Would like to contribute, but don't have any ideas what to do? Check out [our issues](https://github.com/maltsev/htmlnano/labels/help%20wanted).
