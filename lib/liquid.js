var fs = require('fs');
var _ = require('lodash');
var tags = require('./tags');
var Slug = require('./slug');
var Liquid = require("liquid-node");
var debug = require('debug')('brick-liquid:liquid');

var defaultOptions = {
    cache: false,
};

Liquid.Engine.prototype.render = function(tplPath, ctx, pmodularize, pctrl) {
    debug(`rendering ${tplPath}`);
    ctx = ctx || {};
    if (typeof ctx !== 'object') {
        var msg = 'ctx not an object: ' + ctx;
        throw new Error(msg);
    }
    ctx.slug = new Slug(pctrl);
    return this.getTpl(tplPath)
        .then(tpl => link(tpl, ctx))
        .then(pmodularize)
        .then(html => {
            var parent = ctx.slug.parent;
            if (parent) {
                return parent.pendingCtx
                    .then(ctx => _.set(ctx, 'block', html))
                    .then(ctx => pctrl(parent.mid, ctx));
            } else return html;
        });
};

Liquid.Engine.prototype.getTpl = function(tplPath) {
    if (this.brickConfig.cache) {
        var tpl = this.brickCache[tplPath];
        if (tpl) return Promise.resolve(tpl);
    }
    return src(tplPath)
    .then(src => this.parse(src))
    .then(tpl => this.brickCache[tplPath] = tpl);
};

// utilitis

function src(file) {
    return new Promise(function(resolve, reject) {
        fs.readFile(file, 'utf8', function(e, data) {
            return e ? reject(e) : resolve(data);
        });
    });
}

function link(tpl, ctx) {
    var liquid = ctx.slug,
        html;
    return tpl.render(ctx)
    .then(result => html = result)
    .then(html => liquid.pending())
    .then(lktbl => html.replace(/placeholder-(\d+)/g, (expr, name) => lktbl[name]));
}

function liquidFactory(cfg) {
    var engine = new Liquid.Engine();
    engine.brickConfig = _.merge({}, defaultOptions, cfg);
    engine.brickCache = {};
    engine.registerTag("extend", tags.ExtendTag);
    engine.registerTag("include", tags.IncludeTag);
    engine.registerTag("block", tags.BlockTag);
    return engine;
}

module.exports = _.assignIn(liquidFactory, Liquid);

