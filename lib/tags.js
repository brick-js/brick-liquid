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
            val.render(liquidCtx).then(val => [key, val]));
        var id = uuid(),
            ctx = _.merge({}, extractLocals(liquidCtx)),
            slug = ctx.slug;

        var p = Promise.all(promises)
            .then(pairs => _.merge(ctx, _.fromPairs(pairs)))
            .then(ctx =>
                slug.render(this.mid, ctx).then(html => ({
                    id, html
                })));

        slug.children.push(p);
        return `placeholder-${id}`;
    }
}

class LayoutTag extends Liquid.Tag {
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
                val.render(liquidCtx).then(val => [key, val])),
            ctx = extractLocals(liquidCtx);

        var pendingCtx = Promise
            .all(hashes)
            .then(pairs => _.merge(ctx, _.fromPairs(pairs)));

        ctx.slug.parent = {
            mid: this.mid,
            pendingCtx
        };
        return '';
    }
}

// utilities

function uuid() {
    return Math.random().toString(10).substr(2);
}

function extractLocals(liquidCtx) {
    var localArray = _.merge([], liquidCtx.scopes, liquidCtx.environments);
    return _.defaults.apply(_, localArray);
}

function get_hash(markup){
    var hash = {}, match;
    var fmt1 = `((?:${Liquid.VariableSignature.source})+)\\s*=\\s*(.*)\\s*`,
        fmt = `(${Liquid.QuotedFragment.source})=(${Liquid.QuotedFragment.source})`,
        syntax = new RegExp(fmt, 'g');
    while (match = syntax.exec(markup)) {
        var k = match[1], v = new Liquid.Variable(match[2]);
        hash[k] = v;
    }
    return hash;
}

exports.IncludeTag = IncludeTag;
exports.LayoutTag = LayoutTag;
exports.extractLocals = extractLocals;
