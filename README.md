[![NPM version](https://img.shields.io/npm/v/brick-liquid.svg?style=flat)](https://www.npmjs.org/package/brick-liquid)
[![Build Status](https://travis-ci.org/brick-js/brick-liquid.svg?branch=master)](https://travis-ci.org/brick-js/brick-liquid)
[![Dependency manager](https://david-dm.org/brick-js/brick-liquid.png)](https://david-dm.org/brick-js/brick-liquid)

Liquid Template Engine for [Brick.js][brk], implemented with [sirlantis/liquid-node][sirlantis/liquid-node].

## Installation

```bash
npm install -S brick-liquid
```

## Set template engine for brick.js

```javascript
var brickJs = require('brick.js');
var Liquid = require('..');

var liquid = new Liquid({
    cache: false    // disabled by default, see below
});

var brk = brickJs({
    root: path.join(__dirname, 'modules'),
    engine: liquid
});

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

## Layout Extend 

Brick-liquid implemented async helper internaly, to support layout extend. Eg: 

```html
<!-- module: homepage -->
{%extend 'default'%}
<div class="container"> Hello! </div>
```

Above module `homepage` extends module `default`: 

```html
<!-- module: default -->
<!DOCTYPE html>
<html lang="en">
<head>
  <title>{{title}}</title>
  <meta charset="UTF-8">
</head>
<body> {{ block }} </body>
</html>
```

`homepage` will be rendered and then replace `{{ block }}` declaration in `default`.

> Note: local context within `homepage` will be passed into `default`.

## Options

### cache

Type: `Bool`

Default: `false`

If set to `true`, all templates will be loaded only once (for production usage). Otherwise, template file will be reloaded on every HTTP request.

## Registration of New Filter

Brick-liquid is implemented with [sirlantis/liquid-node][sirlantis/liquid-node] internaly. And the `liquid` object defined above is compatible with [sirlantis/liquid-node][sirlantis/liquid-node] `engine` object.

Javascript:

```javascript
liquid.registerFilters({
    UpperCase: input => String(input).toUpperCase()
});
```

Template:

```html
<h3>{{ 'alice' | UpperCase }}</h3>
```

will be rendered as: 

```html
<h3>ALICE</h3>
```

## Registration of New Tag

Registration of new tag is compatible with [sirlantis/liquid-node][sirlantis/liquid-node].

Javascript:

```javascript
class UserAnchor extends Liquid.Tag {
    render(ctx) {
        var locals = Liquid.extractLocals(ctx),
            user = locals.user;
        return `<a href="/users/${user.id}">${user.name}</a>`;
    }
}
liquid.registerTag("UserAnchor ", UserAnchor);
```

Template:

```html
{% UserAnchor %}
```

will be rendered as: 

```html
<!-- locals: {user: {name: alice, id: 123}} -->
<a href="/users/123">alice</a>
```

[brk]: https://github.com/brick-js/brick.js
[sirlantis/liquid-node]: https://github.com/sirlantis/liquid-node
