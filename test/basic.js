describe('memory store', function () {
  doBasicTest('memory');
});

describe('mysql store', function () {
  var mysql = require('mysql');
  doBasicTest('mysql', {database: 'relations_test', client: mysql.createConnection({user: 'root'})});
});

describe('redis store', function () {
  var redis = require('redis');
  doBasicTest('redis', {client: redis.createClient(), prefix: 'relations-test:test-prefix'});
});

describe('mongodb store', function () {
  var MongoClient = require('mongodb').MongoClient;
  doBasicTest('mongodb', { client: MongoClient.connect('mongodb://travis:test@localhost:27017/relations_test') });
});
