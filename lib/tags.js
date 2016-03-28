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

        // hash ctx
        this.hash = {};
        var fmt = `((?:${Liquid.VariableSignature.source})+)\s*=\\s*(.*)\\s*`,
            syntax = new RegExp(fmt, 'g');
        while (match = syntax.exec(markup)) {
            var k = match[1], v = new Liquid.Variable(match[2]);
            this.hash[k] = v;
        }
    }
    render(liquidCtx) {
        debug(`include tag: ${this.mid}`);
        var promises = _.map(this.hash, _.partial(hash2promise, liquidCtx));
        var id = uuid(),
            ctx = _.merge({}, extractLocals(liquidCtx)),
            brick = ctx.brick;

        var p = Promise.all(promises)
            .then(pairs => {
                var hash = _.fromPairs(pairs);
                return _.merge(ctx, hash);
            })
            .then(ctx =>
                brick.render(this.mid, ctx).then(html => ({
                    id, html
                })));

        brick.children.push(p);
        return `liquid-pending-${id}`;
    }
}

function hash2promise(ctx, val, key) {
    return val.render(ctx).then(val => [key, val]);
}

class ExtendTag extends Liquid.Tag {
    constructor(template, tagName, markup, tokens) {
        super();
        var match = midPattern.exec(markup);
        if (!match) {
            var msg = markup + ' not valid: ' + midPattern;
            throw new Liquid.SyntaxError(msg);
        }
        this.mid = match[1];
    }
    render(liquidCtx) {
        debug('extend tag', this.mid);

        var ctx = extractLocals(liquidCtx),
            brick = ctx.brick;
        brick.parent = brick.render(this.mid, ctx);
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

exports.IncludeTag = IncludeTag;
exports.ExtendTag = ExtendTag;
exports.BlockTag = BlockTag;
exports.extractLocals = extractLocals;
