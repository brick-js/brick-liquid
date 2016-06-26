const chai = require("chai");
const mock = require('mock-fs');
const should = chai.should();
const Liquid = require('..');
chai.use(require("chai-as-promised"));

describe('options', function() {
    var ctx = {
        name: 'harttle'
    };
    afterEach(function(){
        mock.restore();
    });

    it('should allow empty config', function() {
        var liquid = Liquid();
        mock({
            '/user.liquid': "<p>{{ name }}{{ id }}</p>"
        });
        return liquid.render('/user.liquid', ctx, x=>x)
            .should.eventually.equal('<p>harttle</p>');
    });
    it('should respect cache:true', function() {
        var liquid = Liquid({
            cache: true
        });
        mock({
            '/tmp.liquid': '{{ name }}'
        });
        return liquid.render('/tmp.liquid', ctx, x=>x)
            .then(x => mock({'/tmp.liquid': 'before{{ name }}'}))
            .then(x => liquid.render('/tmp.liquid', ctx, x=>x))
            .should.eventually.equal('harttle');
    });
    it('should respect cache:false', function() {
        var liquid = Liquid({
            cache: false
        });
        mock({
            '/tmp.liquid': '{{ name }}'
        });
        return liquid.render('/tmp.liquid', ctx, x=>x)
            .then(x => mock({'/tmp.liquid': 'before{{ name }}'}))
            .then(x => liquid.render('/tmp.liquid', ctx, x=>x))
            .should.eventually.equal('beforeharttle');
    });
});

