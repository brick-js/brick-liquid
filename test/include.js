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

describe('include tag', function() {
    var root = Path.resolve(__dirname, '../cases'),
        liquid = Liquid();

    it('should handle include tag', function() {
        return liquid.render(path('navbar.liquid'), {}, c => Promise.resolve('user'))
            .should.eventually.equal('before' + 'user' + 'after\n');
    });
    it('should inherit parent context', function() {
        var pctrl = (mid, ctx) => Promise.resolve(mid + ',' + ctx.name);
        return liquid.render(path('navbar.liquid'), {
                name: 'harttle'
            }, pctrl)
            .should.eventually.equal('before' + 'user,harttle' + 'after\n');
    });
    it('should accept hash context', function() {
        var pctrl = (mid, ctx) => Promise.resolve(mid + ',' + ctx.name);
        return liquid.render(path('user-list.liquid'), {
                user: {
                    name: 'harttle'
                }
            }, pctrl)
            .should.eventually.equal('user,harttle\n');
    });
    it('should accept string hash context', function() {
        var pctrl = (mid, ctx) => Promise.resolve(mid + ',' + ctx.name);
        return liquid.render(path('user-array.liquid'), {}, pctrl)
            .should.eventually.equal('user,harttle\n');
    });
});

function path(p) {
    return Path.resolve(__dirname, '../cases', p);
}

