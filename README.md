
Handlebars wrapper for [Brick.js][brk].

# Quick Start

## Installation

```bash
npm install -S brick-hbs
```

## Set template engine for brick.js

```javascript
var brickJs = require('brick.js');
var hbs = require('brick-hbs');

var brk = brickJs({
    root: path.join(__dirname, 'modules'),
    render: app.render.bind(app),
    engine: hbs.brick({
        cache: false
    })
});

app.use('/', brk.express);
```

# Include Partials/Modules

In Brick.js, partials are organized as modules. Eg:

File `footer/index.hbs` in module `footer`:

```html
<footer> Powered by Brick.js </footer>
```

File `home/index.hbs` in module `home`:

```html
<html>
<body>
  <p>Demo Page</p>
  {{include 'footer'}}
</body>
</html>
```

The HTML for `home` page will be rendered as:

```html
<html>
<body>
  <p>Demo Page</p>
  <footer> Powered by Brick.js </footer>
</body>
</html>
```

# Layout Extend 

Brick-hbs implemented async helper internaly, to support layout extend. Eg: 

File `layout1/index.html` in module `layout1`:

```html
<html>
<title>Common Title</title>
<body>
  {{block}}
</body>
</html>
```

File `home/index.hbs` in module `home`:

```html
{{extend 'layout1'}}
<p> Contents for home page </p>
```

The HTML for `home` page will be rendered as:

```html
<html>
<title>Common Title</title>
<body>
  <p> Contents for home page </p>
</body>
</html>
```

# Options

## cache

Default: `false`

If set to `true`, all templates will be loaded only once (for production usage).

[brk]: https://github.com/harttle/brick-hbs
