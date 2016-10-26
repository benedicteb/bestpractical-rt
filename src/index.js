var request = require('request');
var urljoin = require('url-join');

// Enable cookie jar
request = request.defaults({jar: true})

const uribase = 'https://rt.uio.no/REST/1.0/'
var j = request.jar()

var RTObject = {
  loggedIn: false,

  login: function(callback) {
    const body = 'user=' + this.username + "&pass=" + this.password

    request.post({
      headers: {'content-type': 'application/x-www-form-urlencoded'},
      url: uribase,
      body: body,
      jar: j,
    }, function(error, response, body) {
      if (response.status_code == 200) {
        this.loggedIn = true;
        callback();
      }

      this.loggedIn = false;
    })
  },

  search: function(query, callback) {
    var doQuery = function(jar) {
      request({
        url: urljoin(uribase, 'search/ticket'), {
        query: query
      }, function(error, response, body) {
        console.log(response.body);
      })
    }

    if (!this.loggedIn) {
      this.login(doQuery);
    }

    doQuery();
  }
};

function RT(username, password) {
  RTObject.username = username;
  RTObject.password = password;
  return RTObject;
}

module.exports = RT;
