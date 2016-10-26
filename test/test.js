var rtnode = require('../index');
var read = require('read');

const username = 'rt-rapport';

read({prompt: 'Password: ', silent: true}, function(error, input) {
  const password = input;

  var rt = rtnode(username, password);
  rt.search("queue = 'usit-mlm' and (status = 'open' or status='new')")
})
