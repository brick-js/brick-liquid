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

    it('should pass context to parent', function() {
        return liquid.render(path('home.liquid'), ctx, render)
            .should.eventually.equal('\n<p>harttle</p>\nharttle\n');
    });
    it('should pass hash context to parent', function() {
        return liquid.render(path('account.liquid'), ctx, render)
            .should.eventually.equal('harttle\n<p>harttle</p>\nharttle\n');
    });
    it('should pass string hash context to parent', function() {
        return liquid.render(path('about.liquid'), ctx, render)
            .should.eventually.equal('harttle\n<p>harttle</p>\nharttle\n');
    });
    function render(mid, ctx){
        return liquid.render(path(`${mid}.liquid`), ctx, render);
    }
});

function path(p) {
    return Path.resolve(__dirname, '../cases', p);
}

