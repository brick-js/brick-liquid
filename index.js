var _ = require('lodash');
var Liquid = require("liquidjs");
var tags = require('./tags.js');

function liquidFactory(config) {
    config = _.defaults(config, {
        cache: false
    });
    var engine = Liquid(config);

    tags(engine);

    return {
        render,
        parse: engine.parse.bind(engine),
        parseAndRender: engine.parseAndRender.bind(engine),
        parser: engine.parser,
        renderer: engine.renderer,
        evalOutput: engine.evalOutput.bind(engine),
        registerFilter: engine.registerFilter.bind(engine),
        registerTag: engine.registerTag.bind(engine)
    };

    function render(tplPath, ctx, pmodularize, pctrl) {
        var brick = {
            pctrl: pctrl,
            pmodularize: pmodularize,
            modularized: false
        };
        ctx = _.assign(ctx, {
            brick: brick
        });
        return engine.renderFile(tplPath, ctx)
            .then(html => {
                return brick.modularized ? html : pmodularize(html);
            });
    }
}

module.exports = _.assignIn(liquidFactory, Liquid);
