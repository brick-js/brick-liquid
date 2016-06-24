const chai = require("chai");
const mock = require('mock-fs');
const should = chai.should();
const Liquid = require('..');
chai.use(require("chai-as-promised"));

describe('options', function() {
    var ctx = {
        name: 'harttle'
    };
    beforeEach(function(){
        mock({
            '/user.liquid': "<p>{{ name }}{{ id }}</p>",
            '/tmp.liquid': '{{ name }}'
        });
    });
    afterEach(function(){
        mock.restore();
    });

    it('should allow empty config', function() {
        var liquid = Liquid();
        return liquid.render('/user.liquid', ctx)
            .should.eventually.equal('<p>harttle</p>');
    });
    it('should respect cache:true', function() {
        var liquid = Liquid({
            cache: true
        });
        return liquid.render('/tmp.liquid', ctx)
            .then(x => mock({'/tmp.liquid': 'before{{ name }}'}))
            .then(x => liquid.render('/tmp.liquid', ctx))
            .should.eventually.equal('harttle');
    });
    it('should respect cache:false', function() {
        var liquid = Liquid({
            cache: false
        });
        return liquid.render('/tmp.liquid', ctx)
            .then(x => mock({'/tmp.liquid': 'before{{ name }}'}))
            .then(x => liquid.render('/tmp.liquid', ctx))
            .should.eventually.equal('beforeharttle');
    });
});

