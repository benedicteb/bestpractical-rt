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
    const doQuery = function() {
      request({
        url: urljoin(uribase, 'search/ticket'),
        qs: {
          query: query,
        }
      }, function(error, response, body) {
        const lines = body.split(/\r?\n/);
        const pattern = /^(\d+): (.+)$/;
        const tickets = {};

        for (const i in lines) {
          const match = pattern.exec(lines[i]);

          if (match) {
            const id = parseInt(match[1]);
            const subject = match[2];
            tickets[id] = subject;
          }
        }

        callback(tickets);
      })
    }

    this._loginThenQuery(doQuery);
  }

  ticketProperties(ticketId, callback) {
    const getTicketInfo = function() {
      request({
        url: urljoin(uribase, 'ticket', ticketId, 'show')
      }, function(error, response, body) {
        const lines = body.split(/\r?\n/);
        const pattern = /^([^:]+): (.+)$/;
        const ticketInfo = {};

        for (const i in lines) {
          const match = pattern.exec(lines[i]);

          if (match) {
            const name = match[1];
            const value = match[2];
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
