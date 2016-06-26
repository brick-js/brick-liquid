var _ = require('lodash');
var Liquid = require("shopify-liquid");
var tags = require('./tags.js');

function liquidFactory(config) {
    config = _.defaults(config, {
        cache: false
    });
    var engine = Liquid(config);

    engine.registerTag('layout', tags.layout);
    engine.registerTag('block', tags.block);
    engine.registerTag('include', tags.include);

    return {
        render,
        parseAndRender: engine.parseAndRender.bind(engine),
        parser: engine.parser,
        renderer: engine.renderer,
        evalOutput: engine.evalOutput.bind(engine),
        handleCache: engine.handleCache.bind(engine)
    };

    function render(tplPath, ctx, pmodularize, pctrl) {
        var html = engine.renderFile(tplPath, ctx);
        html = pmodularize(html);
        return renderAsync(html, pctrl);
    }
}

function renderAsync(html, pctrl) {
    var placeholders = html.match(new RegExp('{{pending\.\\w+}}', 'g'));
    if (placeholders === null) return Promise.resolve(html);

    var pendings = placeholders.map(placeholder => {
        var record = tags.register.get(placeholder);
        return pctrl(record.mid, record.ctx).then(partial => {
            html = record.map(html, partial);
        });
    });
    return Promise.all(pendings).then(x => renderAsync(html, pctrl));
}

module.exports = _.assignIn(liquidFactory, Liquid);
