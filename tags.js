var _ = require('lodash');
var Liquid = require("liquidjs");
var lexical = Liquid.lexical;

var registerWith = function(liquid) {
    var layout = {
        parse: function(token, remainTokens) {
            var match = lexical.value.exec(token.args);
            if (!match) error(`illegal token ${token.raw}`, token);
            this.layout = match[0];
            this.tpls = liquid.parser.parse(remainTokens);
        },
        render: function(scope, hash) {
            var layout = Liquid.evalValue(this.layout, scope);
            var brick = scope.get('brick');
            brick.modularized = true;
            var ctx = _.merge(scope.getAll(), hash);
            return Promise
                .all([
                    liquid.renderer.renderTemplates(this.tpls, scope)
                        .then(html => brick.pmodularize(html)),
                    brick.pctrl(layout, ctx)
                ])
                .then(arr => {
                    var child = arr[0];
                    var parent = arr[1];
                    return parent.replace('{{block}}', child);
                });
        }
    };

    var block = {
        render: () => Promise.resolve('{{block}}')
    };

    var include = {
        parse: function(token, remainTokens) {
            var match = lexical.value.exec(token.args);
            if (!match) error(`illegal token ${token.raw}`, token);
            this.include = match[0];
        },
        render: function(scope, hash) {
            var include = Liquid.evalValue(this.include, scope);
            var ctx = _.merge(scope.getAll(), hash);
            var pctrl = scope.get('brick.pctrl');
            return pctrl(include, ctx);
        }
    };
    
    liquid.registerTag('layout', layout);
    liquid.registerTag('block', block);
    liquid.registerTag('include', include);
};

module.exports = registerWith;
