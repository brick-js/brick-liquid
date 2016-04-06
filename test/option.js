var chai = require("chai");
var should = chai.should();
var Liquid = require('..');
var Path = require('path');
var fs = require('fs');
chai.use(require("chai-as-promised"));
var tmp = '/tmp/brick-liquid-test.liquid';

Object.defineProperty(
    Promise.prototype,
    'should',
    Object.getOwnPropertyDescriptor(Object.prototype, 'should')
);

describe('options', function() {
    it('should allow empty config', function() {
        var liquid = Liquid();
        var p = Path.resolve(__dirname, '../cases/user.liquid');
        return liquid.render(p, {
                name: 'harttle'
            })
            .should.eventually.equal('<p>harttle</p>\n');
    });
    it('should respect cache:true', function() {
        var liquid = Liquid({
            cache: true
        });
        fs.writeFileSync(tmp, '{{ name }}', 'utf-8');

        return liquid.render(tmp, {
                name: 'harttle'
            })
            .then(x => fs.writeFileSync(tmp, 'before{{ name }}', 'utf-8'))
            .then(x => liquid.render(tmp, {
                name: 'harttle'
            }))
            .should.eventually.equal('harttle');
    });
    it('should respect cache:false', function() {
        var liquid = Liquid({
            cache: false
        });
        fs.writeFileSync(tmp, '{{ name }}', 'utf-8');

        return liquid.render(tmp, {
                name: 'harttle'
            })
            .then(x => fs.writeFileSync(tmp, 'before{{ name }}', 'utf-8'))
            .then(x => liquid.render(tmp, {
                name: 'harttle'
            }))
            .should.eventually.equal('beforeharttle');
    });
});

