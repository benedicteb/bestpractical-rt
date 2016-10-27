import RT from '../index';
import read from 'read';

const username = 'rt-rapport';

const afterSearch = function(result) {
  console.log(result);
}

read({prompt: 'Password: ', silent: true}, function(error, input) {
  const password = input;

  const rt = new RT(username, password, 'https://rt.uio.no');
  rt.search("queue = 'usit-mlm' and (status = 'open' or status='new')", afterSearch)
  rt.ticketProperties(2252958, afterSearch);
  rt.ticketHistory(2252958, afterSearch);
  rt.ticketHistoryEntry(2252958, 38867588, afterSearch);
})
