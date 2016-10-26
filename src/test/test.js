var RT = require('../index');
var read = require('read');

const username = 'rt-rapport';

var afterSearch = function(result) {
  console.log(result);
}

read({prompt: 'Password: ', silent: true}, function(error, input) {
  const password = input;

  var rt = new RT(username, password);
  rt.search("queue = 'usit-mlm' and (status = 'open' or status='new')", afterSearch)
  rt.ticketProperties(2252958, afterSearch);
})
