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
        var lines = body.split(/\r?\n/);
        const pattern = /^(\d+): (.+)$/;
        var tickets = {};

        for (var i in lines) {
          var match = pattern.exec(lines[i]);

          if (match) {
            var id = parseInt(match[1]);
            var subject = match[2];
            tickets[id] = subject;
          }
        }

        callback(tickets);
      })
    }

    this._loginThenQuery(doQuery);
  }

  ticketProperties(ticketId, callback) {
    var getTicketInfo = function() {
      request({
        url: urljoin(uribase, 'ticket', ticketId, 'show')
      }, function(error, response, body) {
        var lines = body.split(/\r?\n/);
        const pattern = /^([^:]+): (.+)$/;
        var ticketInfo = {};

        for (var i in lines) {
          var match = pattern.exec(lines[i]);

          if (match) {
            var name = match[1];
            var value = match[2];
            ticketInfo[name] = value;
          }
        }

        callback(ticketInfo);
      })
    }

    this._loginThenQuery(getTicketInfo);
  }

  _loginThenQuery(callback) {
    if (!this.loggedIn) {
      this.login(callback);
      return;
    }

    callback();
  }
}

module.exports = RT;
