const chai = require("chai");
const should = chai.should();
const mock = require('mock-fs');
const Liquid = require('..');
chai.use(require("chai-as-promised"));

describe('layout', function() {
    var liquid, ctx = {name: 'harttle'};

    beforeEach(function(){
        liquid = Liquid();
        mock({
            '/home.liquid': "{%layout 'layout'%}<p>{{name}}</p>",
            '/account.liquid': "{%layout 'layout' title:name%}<p>{{name}}</p>",
            '/about.liquid': "{%layout 'layout' title:'harttle'%}<p>{{name}}</p>",
            '/layout.liquid': "{{title}}{%block%}{{name}}",
            '/content-layout.liquid': "{%layout 'layout'%}foo{%block%}{{name}}bar",
            '/content-home.liquid': "{%layout 'content-layout'%}FOO"
        });
    });
    afterEach(function(){
        mock.restore();
    });

    it('should pass context to parent', function() {
        return liquid.render('/home.liquid', ctx, x => x, render)
            .should.eventually.equal('<p>harttle</p>harttle');
    });
    it('should pass hash context to parent', function() {
        return liquid.render('/account.liquid', ctx, x => x, render)
            .should.eventually.equal('harttle<p>harttle</p>harttle');
    });
    it('should pass string hash context to parent', function() {
        return liquid.render('/about.liquid', ctx, x => x, render)
            .should.eventually.equal('harttle<p>harttle</p>harttle');
    });
    it('should support recursive layout', function() {
        return liquid.render('/content-home.liquid', ctx, x => x, render)
            .should.eventually.equal('fooFOOharttlebarharttle');
    });
    function render(mid, ctx){
        return liquid.render(`/${mid}.liquid`, ctx, x => x, render);
    }
});

