'use strict';
var Promise = require('bluebird');

module.exports = class Queue {
  constructor() {
    this.reset();
  }

  run() {
    this.disabled = false;
    this.checkQueue();
  }

  reset() {
    this.queue = [];
    this.disabled   = true;
    this.activeTask = null;
  }

  push(handler) {
    var defer = Promise.pending();
    this.queue.push(defer);
    this.checkQueue();

    var promise = defer.promise.then(handler);
    this.finishActiveTaskWith(promise);

    return promise;
  }

  checkQueue() {
    if (!this.disabled && !this.activeTask && this.queue.length) {
      this.activeTask = this.queue.shift();
      this.activeTask.resolve();
    }
  }

  finishActiveTaskWith(promise) {
    promise.bind(this).finally(() => {
      this.activeTask = null;
      this.checkQueue();
    });
  }
};
