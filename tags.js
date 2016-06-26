var _ = require('lodash');
var Liquid = require("shopify-liquid");
var lexical = Liquid.lexical;

var register = (function() {
    var cache = {};
    return {
        set: (key, val) => cache[key] = val,
        get: key => cache[key],
        remove: key => delete cache[key]
    };
})();

var layout = {
    parse: function(token, remainTokens) {
        var match = lexical.value.exec(token.args);
        if(!match) error(`illegal token ${token.raw}`, token);
        this.layout = match[0];
    },
    render: function(scope, hash) {
        var layout = Liquid.evalValue(this.layout, scope);
        var placeholder = `{{pending.${Math.random().toString(36).substr(2)}}}`;
        register.set(placeholder, {
            ctx: _.merge(scope.get(), hash),
            mid: layout,
            map: (html, layout) => layout.replace('{{block}}', html.replace(placeholder, ''))
        });
        return placeholder;
    }
};
var block = {
    render: () => '{{block}}'
};
var include = {
    parse: function(token, remainTokens) {
        var match = lexical.value.exec(token.args);
        if(!match) error(`illegal token ${token.raw}`, token);
        this.include = match[0];
    },
    render: function(scope, hash) {
        var include = Liquid.evalValue(this.include, scope);
        var placeholder = `{{pending.${Math.random().toString(36).substr(2)}}}`;
        register.set(placeholder, {
            ctx: _.merge(scope.get(), hash),
            mid: include,
            map: (html, partial) => html.replace(placeholder, partial)
        });
        return placeholder;
    }
};
module.exports = {
    block, include, layout, register
};
