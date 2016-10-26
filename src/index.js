var request = require('request');
var urljoin = require('url-join');

// Enable cookie jar
request = request.defaults({jar: true});

class RT {
  constructor(username, password, host) {
    this.username = username;
    this.password = password;
    this.loggedIn = false;
    this.uribase = urljoin(host, 'REST/1.0');
  }

  login(callback) {
    const body = 'user=' + this.username + "&pass=" + this.password

    request.post({
      headers: {'content-type': 'application/x-www-form-urlencoded'},
      url: this.uribase,
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
        url: urljoin(this.uribase, 'search/ticket'),
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
        url: urljoin(this.uribase, 'ticket', ticketId, 'show')
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
    }.bind(this);

    this._loginThenQuery(getTicketInfo);
  }

  ticketHistory(ticketId, callback) {
    const getTicketHistory = function() {
      request({
        url: urljoin(this.uribase, 'ticket', ticketId, 'history')
      }, function(error, response, body) {
        const lines = body.split(/\r?\n/);
        const pattern = /^(\d+): (.+)$/;
        const historyElements = {};

        for (const i in lines) {
          const match = pattern.exec(lines[i]);

          if (match) {
            const id = parseInt(match[1]);
            const action = match[2];
            historyElements[id] = action;
          }
        }

        callback(historyElements);
      })
    }.bind(this);

    this._loginThenQuery(getTicketHistory);
  }

  ticketHistoryEntry(ticketId, historyId, callback) {
    const getHistoryEntry = function() {
      request({
        url: urljoin(this.uribase, 'ticket', ticketId, 'history/id', historyId)
      }, function(error, response, body) {
        const contentPattern = /Content: ((.|\n)+)\n\nCreator/g;
        const metaPattern = /^([^: ]+): (.+)$/;
        const lines = body.split(/\r?\n/);
        const historyEntry = {};

        const contentMatch = contentPattern.exec(body);

        if (contentMatch) {
          let content = contentMatch[1];
          content = content.replace(/         /g, '');
          historyEntry['Content'] = content;
        }

        for (const i in lines) {
          if (lines[i].indexOf('Content') == 0) {
            continue;
          }

          const match = metaPattern.exec(lines[i]);

          if (match) {
            const name = match[1];
            const value = match[2];
            historyEntry[name] = value;
          }
        }

        callback(historyEntry);
      })
    }.bind(this);

    this._loginThenQuery(getHistoryEntry);
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
