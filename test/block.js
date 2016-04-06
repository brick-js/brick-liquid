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

describe('block tag', function() {
    var root = Path.resolve(__dirname, '../cases');
    var liquid = Liquid();
    var ctx = {name: 'harttle'};

    it('should handle block tag', function() {
        var result = 'before' + 'liquid-pending-block' + 'after\n';
        return liquid.render(path('layout.liquid'))
            .should.eventually.equal(result);
    });
});

function path(p) {
    return Path.resolve(__dirname, '../cases', p);
}

