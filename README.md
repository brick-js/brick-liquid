[![NPM version](https://img.shields.io/npm/v/brick-liquid.svg?style=flat)](https://www.npmjs.org/package/brick-liquid)
[![Build Status](https://travis-ci.org/brick-js/brick-liquid.svg?branch=master)](https://travis-ci.org/brick-js/brick-liquid)
[![Coverage Status](https://coveralls.io/repos/github/brick-js/brick-liquid/badge.svg?branch=master)](https://coveralls.io/github/brick-js/brick-liquid?branch=master)
[![Dependency manager](https://david-dm.org/brick-js/brick-liquid.svg)](https://david-dm.org/brick-js/brick-liquid)

Liquid Template Engine for [Brick.js][brk], implemented with [sirlantis/liquid-node][sirlantis/liquid-node].

## Installation

```bash
npm install -S brick-liquid
```

## Set template engine for brick.js

```javascript
var brickJs = require('brick.js');
var Liquid = require('brick-liquid');

var brk = brickJs();

var liquid = Liquid({
    cache: false    // disabled by default, see below
});

brk.engine('.liquid', liquid);   // set liquid engine for .liquid file 
brk.engine('.html', liquid);     // set liquid engine for .html file

app.use('/', brk.express);
```

## Include Modules(Partials)

In Brick.js, partials are organized as modules,
Sub-modules are imported by `include`. For example:

```html
<html>
<body>
  <div class="container">
    {%include "user-list"%}
  </div>
</body>
</html>
```

Above template will import module `user-list` in `root` directory with local context.

## Layouts

Brick-liquid render is implemented asyncly to support template layout.

Module `homepage`:

```html
{%layout 'default'%}
<div class="container"> Hello! </div>
```

Module `default`: 

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <title>{{title}}</title>
  <meta charset="UTF-8">
</head>
<body> {% block %} </body>
</html>
```

`homepage` will be rendered and then replace `{% block %}` declaration in `default`.
In the meantime, the local context within `homepage` will be passed into `default`.

## Options

### cache

Type: `Bool`

Default: `false`

If set to `true`, all templates will be loaded only once (for production usage). Otherwise, template file will be reloaded on every HTTP request.

## Registration of New Filter

Brick-liquid is implemented with [harttle/liquidjs][impl] internaly. 
And the `liquid` object defined above is compatible with [harttle/liquidjs][impl] `engine` object.

Javascript:

```javascript
liquid.registerFilter('upper', function(v){
  return v.toUpperCase();
});
```

Template:

```html
<h3>{{ 'alice' | upper }}</h3>
```

Output:

```html
<h3>ALICE</h3>
```

## Registration of New Tag

Registration of new tag is compatible with [harttle/liquidjs][impl].

Javascript:

```javascript
engine.registerTag('upper', {
    parse: function(tagToken, remainTokens) {
        this.str = tagToken.args; // name
    },
    render: function(scope, hash) {
        var str = Liquid.evalValue(this.str, scope); // 'alice'
        return str.toUpperCase(); // 'Alice'
    }
});
```

Template:

```html
{% upper 'alice' %}
```

Output:

```html
ALICE
```

[brk]: https://github.com/brick-js/brick.js
[impl]: https://github.com/harttle/liquidjs
