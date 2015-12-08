var User = require('../../models/user.js');
var Cat = require('../../models/cat.js');
var debug = require('debug')('demo:homepage');

exports.url = ['/', '/homepage'];
exports.resolver = function(req, done, fail){
    done({title: 'Liquid Brick.js Demo'});
};
