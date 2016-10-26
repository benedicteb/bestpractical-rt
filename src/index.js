var request = require('request');
var urljoin = require('url-join');

// Enable cookie jar
request = request.defaults({jar: true});

const uribase = 'https://rt.uio.no/REST/1.0/';

class RT {
  constructor(username, password) {
    this.username = username;
    this.password = password;
    this.loggedIn = false;
  }

  login(callback) {
    const body = 'user=' + this.username + "&pass=" + this.password

    request.post({
      headers: {'content-type': 'application/x-www-form-urlencoded'},
      url: uribase,
      body: body,
    }, function(error, response, body) {
      if (response.statusCode == 200) {
        this.loggedIn = true;
        callback();
        return;
      }

      this.loggedIn = false;
      console.log(response.body);
    })
  }

  search(query, callback) {
    var doQuery = function() {
      request({
        url: urljoin(uribase, 'search/ticket'),
        qs: {
          query: query,
        }
      }, function(error, response, body) {
        callback(response.body);
      })
    }

    if (!this.loggedIn) {
      this.login(doQuery);
      return;
    }

    doQuery();
  }
}

module.exports = RT;
