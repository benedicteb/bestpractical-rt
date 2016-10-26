# bestpractical-rt

This package allows you to communicate with Best Practical's Request Tracker via
their REST API documented [here](https://rt-wiki.bestpractical.com/wiki/REST).

## Install

Install from GitHub.

```
$ npm install git://github.com/benedicteb/bestpractical-rt.git
```

## Usage

```javascript
const RT = require('bestpractical-rt');
const rt = new RT('username', 'password', 'https://rt.uio.no');

rt.search("Queue = 'something' AND Status = 'new'", function(result) {
  console.log(result);
})

rt.ticketProperties(123, function(result) {
  console.log(result);
})

rt.ticketHistory(123, function(result) {
  console.log(result);
})

rt.ticketHistoryEntry(ticketId, historyElementId, function(result) {
  console.log(result);
});
```
