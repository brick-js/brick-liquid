/* jshint node: true */
"use strict";
var _ = require('lodash');
var Liquid = require("liquid-node");
var midPattern = /([a-z0-9\/\\_-]+)/i;
var debug = require('debug')('brick-liquid:tags');

class IncludeTag extends Liquid.Tag {
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
        debug(`include tag: ${this.mid}`);

        var id = uuid(),
            ctx = extractLocals(liquidCtx),
            brick = ctx.brick,
            p = brick.render(this.mid, ctx).then(html => ({
                id, html
            }));
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
        debug('block tag', this.mid);
        return 'liquid-pending-block';
    }
}

function uuid() {
    return Math.random().toString(10).substr(2);
}

function extractLocals(liquidCtx){
    var locals = _.merge([], liquidCtx.scopes, liquidCtx.environments);
    return _.defaults.apply(_, locals);
}

exports.IncludeTag = IncludeTag;
exports.ExtendTag = ExtendTag;
exports.BlockTag = BlockTag;
exports.extractLocals = extractLocals;
