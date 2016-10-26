# bestpractical-rt

This package allows you to communicate with Best Practical's Request Tracker via
their REST API documented [here](https://rt-wiki.bestpractical.com/wiki/REST).

## Usage

```javascript
const RT = require('rtnode');
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