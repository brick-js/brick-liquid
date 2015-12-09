var fs = require('fs');
var _ = require('lodash');
var tags = require('./tags');
var Brick = require('./brick');
var Liquid = require("liquid-node");
var debug = require('debug')('brick-liquid:liquid');

var config, cache = {},
    defaultOptions = {
        cache: false,
    };

Liquid.Engine.prototype.render = function(tplPath, ctx, pctrl) {
    debug(`rendering ${tplPath}`);
    ctx = ctx || {};
    if (typeof ctx !== 'object') {
        var msg = 'ctt not an object: ' + ctx;
        debug(msg);
        throw new Error(msg);
    }
    ctx.brick = new Brick(pctrl);
    return this.getTpl(tplPath).then(tpl => link(tpl, ctx));
};

Liquid.Engine.prototype.getTpl = function(tplPath) {
    if (config.cache) {
        var tpl = cache[tplPath];
        if (tpl) return Promise.resolve(tpl);
    }
    return readFile(tplPath)
        .then(src => this.parse(src))
        .then(tpl => cache[tplPath] = tpl);
};

function readFile(file) {
    return new Promise(function(resolve, reject) {
        fs.readFile(file, 'utf8', function(e, data) {
            return e ? reject(e) : resolve(data);
        });
    });
}

function link(tpl, ctx) {
    var liquid = ctx.brick,
        html;
    return tpl.render(ctx)
        .then(result => html = result)
        .then(html => liquid.pending())
        .then(lktbl =>
            html.replace(/liquid-pending-(\d+)/g, (expr, name) => lktbl[name]))
        .then(html => liquid.parent ?
            liquid.parent.then(phtml => phtml.replace('liquid-pending-block', html)) :
            html
        );
}

function liquidFactory(cfg) {
    config = _.merge({}, cfg, defaultOptions);
    var engine = new Liquid.Engine();
    engine.registerTag("extend", tags.ExtendTag);
    engine.registerTag("include", tags.IncludeTag);
    engine.registerTag("block", tags.BlockTag);
    return engine;
}

liquidFactory.Tag = Liquid.Tag;
liquidFactory.extractLocals = tags.extractLocals;

module.exports = liquidFactory;

