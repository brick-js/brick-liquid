/* jshint node: true */
"use strict";

var express = require('express');
var logger = require('morgan');
var path = require('path');
var brickJs = require('brick.js');
var Liquid = require('..');
var debug = require('debug')('demo:app');

// liquid usage
var liquid = new Liquid();

liquid.registerFilters({
    UpperCase: input => String(input).toUpperCase()
});

class UserDetailBtn extends Liquid.Tag {
    render(ctx) {
        var locals = Liquid.extractLocals(ctx);
        return `<button class="btn btn-primary">
        访问${locals.user.name}！</button>`;
    }
}

liquid.registerTag("userBtn", UserDetailBtn);

// express app 
var app = express();

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

var brk = brickJs({
    root: path.join(__dirname, 'modules'),
    engine: liquid
});

app.use('/', brk.express);

module.exports = app;

