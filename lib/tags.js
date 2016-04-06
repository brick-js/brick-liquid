/* jshint node: true */
"use strict";
var _ = require('lodash');
var Liquid = require("liquid-node");
var midPattern = /([a-z0-9\/\\_-]+)/i;
var debug = require('debug')('brick-liquid:tags');

class IncludeTag extends Liquid.Tag {
    constructor(template, tagName, markup, tokens) {
        super();
        // syntax check
        var match = midPattern.exec(markup);
        if (!match) {
            var msg = markup + ' not valid: ' + midPattern;
            throw new Liquid.SyntaxError(msg);
        }
        this.mid = match[1];
        this.hash = get_hash(markup);
    }
    render(liquidCtx) {
        debug(`include tag: ${this.mid}`);
        var promises = _.map(this.hash, (val, key) => 
            hash2promise(liquidCtx, val, key));
        var id = uuid(),
            ctx = _.merge({}, extractLocals(liquidCtx)),
            brick = ctx.brick;

        var p = Promise.all(promises)
            .then(pairs => _.merge(ctx, _.fromPairs(pairs)))
            .then(ctx =>
                brick.render(this.mid, ctx).then(html => ({
                    id, html
                })));

        brick.children.push(p);
        return `liquid-pending-${id}`;
    }
}

class ExtendTag extends Liquid.Tag {
    constructor(template, tagName, markup, tokens) {
        super();
        var match = midPattern.exec(markup);
        if (!match) {
            var msg = markup + ' not valid: ' + midPattern;
            throw new Liquid.SyntaxError(msg);
        }
        this.hash = get_hash(markup);
        this.mid = match[1];
    }
    render(liquidCtx) {
        debug('extend tag', this.mid);

        var hashes = _.map(this.hash, (val, key) => 
            hash2promise(liquidCtx, val, key));

        var ctx = extractLocals(liquidCtx),
            brick = ctx.brick;
        brick.parent = Promise.all(hashes)
        .then(pairs => _.merge(ctx, _.fromPairs(pairs)))
        .then(ctx => brick.render(this.mid, ctx));

        return '';
    }
}

class BlockTag extends Liquid.Tag {
    render() {
        debug('block tag');
        return 'liquid-pending-block';
    }
}

function uuid() {
    return Math.random().toString(10).substr(2);
}

function extractLocals(liquidCtx) {
    var localArray = _.merge([], liquidCtx.scopes, liquidCtx.environments);
    return _.defaults.apply(_, localArray);
}

function get_hash(markup){
    var hash = {}, match;
    var fmt = `((?:${Liquid.VariableSignature.source})+)\s*=\\s*(.*)\\s*`,
        syntax = new RegExp(fmt, 'g');
    while (match = syntax.exec(markup)) {
        var k = match[1], v = new Liquid.Variable(match[2]);
        hash[k] = v;
    }
    return hash;
}

function hash2promise(ctx, val, key) {
    return val.render(ctx).then(val => [key, val]);
}

exports.IncludeTag = IncludeTag;
exports.ExtendTag = ExtendTag;
exports.BlockTag = BlockTag;
exports.extractLocals = extractLocals;
