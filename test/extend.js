var chai = require("chai");
var should = chai.should();
var Liquid = require('..');
var Path = require('path');
var fs = require('fs');
chai.use(require("chai-as-promised"));

Object.defineProperty(
    Promise.prototype,
    'should',
    Object.getOwnPropertyDescriptor(Object.prototype, 'should')
);

describe('extend tag', function() {
    var root = Path.resolve(__dirname, '../cases');
    var liquid = Liquid();
    var ctx = {name: 'harttle'};

    it('should handle extend tag', function() {
        var layout = 'before' + 'liquid-pending-block' + 'after';
        return liquid.render(path('home.liquid'), ctx, c => Promise.resolve(layout))
            .should.eventually.equal('before\n' + '<p>harttle</p>\n' + 'after');
    });
    it('should pass context to parent', function() {
        var pctrl = (mid, c) => Promise.resolve('liquid-pending-block' + mid + c.name);
        return liquid.render(path('home.liquid'), ctx, pctrl)
            .should.eventually.equal('\n' + '<p>harttle</p>\n' + 'layoutharttle');
    });
    it('should pass hash context to parent', function() {
        var pctrl = (mid, c) => Promise.resolve('liquid-pending-block' + mid + c.title);
        return liquid.render(path('account.liquid'), ctx, pctrl)
            .should.eventually.equal('\n' + '<p>harttle</p>\n' + 'layoutharttle');
    });
    it('should pass string hash context to parent', function() {
        var pctrl = (mid, ctx) => Promise.resolve('liquid-pending-block' + mid + ctx.title);
        return liquid.render(path('about.liquid'), ctx, pctrl)
            .should.eventually.equal('\n<p>harttle</p>\nlayoutharttle');
    });
});

function path(p) {
    return Path.resolve(__dirname, '../cases', p);
}

