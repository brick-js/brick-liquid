const chai = require("chai");
const mock = require('mock-fs');
const should = chai.should();
const Liquid = require('..');
chai.use(require("chai-as-promised"));

describe('include', function() {
    var liquid, user = { name: 'harttle' };

    beforeEach(function(){
        liquid = Liquid();
        mock({
            '/navbar.liquid': "before{% include 'user' %}after",
            '/user.liquid': "<p>{{ name }}{{ id }}</p>",
            '/user-list-1.liquid': "{% include 'user' name:user.name %}",
            '/user-list-2.liquid': "{% include 'user' name:'hart tle' %}",
            '/user-list-3.liquid': "{% include 'user' name:username id:3 %}"
        });
    });
    afterEach(function(){
        mock.restore();
    });

    it('should inherit parent context', function() {
        return liquid.render('/navbar.liquid', user, x => x, render)
            .should.eventually.equal('before<p>harttle</p>after');
    });
    it('should accept hash context', function() {
        return liquid.render('/user-list-1.liquid', {user}, x => x, render)
            .should.eventually.equal('<p>harttle</p>');
    });
    it('should accept string hash context', function() {
        return liquid.render('/user-list-2.liquid', {}, x => x, render)
            .should.eventually.equal('<p>hart tle</p>');
    });
    it('should accept multiple hash context', function() {
        return liquid.render('/user-list-3.liquid', {username: 'harttle'}, x => x, render)
            .should.eventually.equal('<p>harttle3</p>');
    });

    function render(mid, ctx){
        return liquid.render(`/${mid}.liquid`, ctx, x => x, render);
    }
});


