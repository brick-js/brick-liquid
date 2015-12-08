/* jshint node: true */
"use strict";

var express = require('express');
var logger = require('morgan');
var path = require('path');
var brickJs = require('brick.js');
var Liquid = require('..');

// liquid usage
var liquid = new Liquid({
    cache: false
});
liquid.registerFilters({
    myFilter: input => String(input).toUpperCase()
});
class MyTag extends Liquid.Tag {
    render() {
        return "that's me!";
    }
}
liquid.registerTag("MyTag", MyTag);

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

