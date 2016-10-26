'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var request = require('request');
var urljoin = require('url-join');

// Enable cookie jar
request = request.defaults({ jar: true });

var RT = function () {
  function RT(username, password, host) {
    _classCallCheck(this, RT);

    this.username = username;
    this.password = password;
    this.loggedIn = false;
    this.uribase = urljoin(host, 'REST/1.0');
  }

  _createClass(RT, [{
    key: 'login',
    value: function login(callback) {
      var body = 'user=' + this.username + "&pass=" + this.password;

      request.post({
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        url: this.uribase,
        body: body
      }, function (error, response, body) {
        if (response.statusCode == 200) {
          this.loggedIn = true;
          callback();
          return;
        }

        this.loggedIn = false;
        console.log(response.body);
      });
    }
  }, {
    key: 'search',
    value: function search(query, callback) {
      var doQuery = function () {
        request({
          url: urljoin(this.uribase, 'search/ticket'),
          qs: {
            query: query
          }
        }, function (error, response, body) {
          var lines = body.split(/\r?\n/);
          var pattern = /^(\d+): (.+)$/;
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
        });
      }.bind(this);

      this._loginThenQuery(doQuery);
    }
  }, {
    key: 'ticketProperties',
    value: function ticketProperties(ticketId, callback) {
      var getTicketInfo = function () {
        request({
          url: urljoin(this.uribase, 'ticket', ticketId, 'show')
        }, function (error, response, body) {
          var lines = body.split(/\r?\n/);
          var pattern = /^([^:]+): (.+)$/;
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
        });
      }.bind(this);

      this._loginThenQuery(getTicketInfo);
    }
  }, {
    key: 'ticketHistory',
    value: function ticketHistory(ticketId, callback) {
      var getTicketHistory = function () {
        request({
          url: urljoin(this.uribase, 'ticket', ticketId, 'history')
        }, function (error, response, body) {
          var lines = body.split(/\r?\n/);
          var pattern = /^(\d+): (.+)$/;
          var historyElements = {};

          for (var i in lines) {
            var match = pattern.exec(lines[i]);

            if (match) {
              var id = parseInt(match[1]);
              var action = match[2];
              historyElements[id] = action;
            }
          }

          callback(historyElements);
        });
      }.bind(this);

      this._loginThenQuery(getTicketHistory);
    }
  }, {
    key: 'ticketHistoryEntry',
    value: function ticketHistoryEntry(ticketId, historyId, callback) {
      var getHistoryEntry = function () {
        request({
          url: urljoin(this.uribase, 'ticket', ticketId, 'history/id', historyId)
        }, function (error, response, body) {
          var contentPattern = /Content: ((.|\n)+)\n\nCreator/g;
          var metaPattern = /^([^: ]+): (.+)$/;
          var lines = body.split(/\r?\n/);
          var historyEntry = {};

          var contentMatch = contentPattern.exec(body);

          if (contentMatch) {
            var content = contentMatch[1];
            content = content.replace(/         /g, '');
            historyEntry['Content'] = content;
          }

          for (var i in lines) {
            if (lines[i].indexOf('Content') == 0) {
              continue;
            }

            var match = metaPattern.exec(lines[i]);

            if (match) {
              var name = match[1];
              var value = match[2];
              historyEntry[name] = value;
            }
          }

          callback(historyEntry);
        });
      }.bind(this);

      this._loginThenQuery(getHistoryEntry);
    }
  }, {
    key: '_loginThenQuery',
    value: function _loginThenQuery(callback) {
      if (!this.loggedIn) {
        this.login(callback);
        return;
      }

      callback();
    }
  }]);

  return RT;
}();

module.exports = RT;