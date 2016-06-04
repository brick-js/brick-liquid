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
        liquid = Liquid(),
        user = { name: 'harttle' };

    it('should inherit parent context', function() {
        return liquid.render(path('navbar.liquid'), user, x => x, render)
            .should.eventually.equal('before<p>harttle</p>\nafter\n');
    });
    it('should accept hash context', function() {
        return liquid.render(path('user-list-1.liquid'), {user}, x => x, render)
            .should.eventually.equal('<p>harttle</p>\n\n');
    });
    it('should accept string hash context', function() {
        return liquid.render(path('user-list-2.liquid'), {}, x => x, render)
            .should.eventually.equal('<p>hart tle</p>\n\n');
    });
    it('should accept multiple hash context', function() {
        return liquid.render(path('user-list-3.liquid'), {username: 'harttle'}, x => x, render)
            .should.eventually.equal('<p>harttle3</p>\n\n');
    });

    function render(mid, ctx){
        return liquid.render(path(`${mid}.liquid`), ctx, x => x, render);
    }
});

function path(p) {
    return Path.resolve(__dirname, '../cases', p);
}

