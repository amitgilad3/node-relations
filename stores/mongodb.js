var store   = module.exports = require('eventflow')()
  , Promise = require('bluebird');

var client, collection;

var MONGO_DUPLICATE_KEY_ERROR_CODE = 11000;

store.on('init', function (options, cb) {
  if (!options.client) {
    return cb(new Error('must pass a node-mongodb-native client in options.client to use mongodb store'));
  }

  var clientPromise;
  if (options.client.then) {
    clientPromise = options.client;
  }
  else {
    clientPromise = Promise.resolve(client);
  }

  return clientPromise
    .then(instance => client = instance)
    .then(client   => collection = client.collection(options.collection || 'relations'))
    .then(() => collection.ensureIndex({ 'context': 1, 'subject': 1, 'role': 1, 'object': 1 }, { unique: true, dropDups: true }))
    .then(() => collection.ensureIndex({ 'context': 1 }))
    .then(() => collection.ensureIndex({ 'subject': 1 }))
    .then(() => collection.ensureIndex({ 'role':    1 }))
    .then(() => collection.ensureIndex({ 'object':  1 }))
    .then(() => cb())
    .catch(err => cb(err));
});

store.on('declaration', function (cmd, cb) {
  var record = {
    'context': cmd.ctx.name,
    'subject': cmd.subject,
    'role':    cmd.role,
    'object':  cmd.object || ''
  };

  collection
    .insert(record)
    .then(result => cb())
    .catch(error => error.code === MONGO_DUPLICATE_KEY_ERROR_CODE ? cb() : cb(error));
});

store.on('revocation', function (cmd, cb) {
  var record = {
    'context': cmd.ctx.name,
    'subject': cmd.subject,
    'role':    cmd.role,
    'object':  cmd.object
  };

  collection
    .remove(record)
    .then(result => cb())
    .catch(error => cb(error));
});

store.on('verb-question', function (cmd, cb) {
  var query = {
    'context': cmd.ctx.name,
    'subject': cmd.subject,
    'role':    { $in: cmd.ctx.verbs[cmd.verb] },
    'object':  { $in: [ '', cmd.object ] }
  };

  collection
    .findOne(query)
    .then(result => cb(null, !!result))
    .catch(error => cb(error));
});

store.on('role-question', function (cmd, cb) {
  var query = {
    'context': cmd.ctx.name,
    'subject': cmd.subject,
    'role':    cmd.role,
    'object':  cmd.object || ''
  };

  collection
    .findOne(query)
    .then(result => cb(null, !!result))
    .catch(error => cb(error));
});

store.on('verb-request', function (cmd, cb) {
  var query = {
    'context': cmd.ctx.name,
    'subject': cmd.subject,
    'role':    { $in: cmd.ctx.verbs[cmd.verb] },
    'object':  { $ne: '' }
  };

  collection
    .find(query)
    .toArray()
    .then(result => cb(null, result.map(record => record.object)))
    .catch(error => cb(error));
});

store.on('role-request', function (cmd, cb) {
  var query = {
    'context': cmd.ctx.name,
    'subject': cmd.subject,
    'role':    cmd.role,
    'object':  { $ne: '' }
  };

  collection
    .find(query)
    .toArray()
    .then(result => cb(null, result.map(record => record.object)))
    .catch(error => cb(error));
});

store.on('verb-subject-request', function (cmd, cb) {
  var query = {
    'context': cmd.ctx.name,
    'role':    { $in: cmd.ctx.verbs[cmd.verb] },
    'object':  cmd.object
  };

  collection
    .find(query)
    .toArray()
    .then(result => cb(null, result.map(record => record.subject)))
    .catch(error => cb(error));
});

store.on('role-subject-request', function (cmd, cb) {
  var query = {
    'context': cmd.ctx.name,
    'role':    cmd.role,
    'object':  cmd.object
  };

  collection
    .find(query)
    .toArray()
    .then(result => cb(null, result.map(record => record.subject)))
    .catch(error => cb(error));
});

store.on('object-verb-request', function (cmd, cb) {
  var query = {
    'context': cmd.ctx.name,
    'subject': cmd.subject,
    'object':  cmd.object
  };

  collection
    .find(query)
    .toArray()
    .then(result => cb(null, transformResponse(result)))
    .catch(error => cb(error));

    function transformResponse(result) {
      return result.reduce((verbs, record) => verbs.concat(cmd.ctx.roles[record.role] || [ ]), [ ]);
    }
});

store.on('object-role-map-request', function (cmd, cb) {
  var query = {
    'context': cmd.ctx.name,
    'subject': cmd.subject
  };

  collection
    .find(query)
    .toArray()
    .then(result => cb(null, transformResponse(result)))
    .catch(error => cb(error));

    function transformResponse(result) {
      return result.reduce((map, record) => {
        map[record.object] || (map[record.object] = [ ]);
        map[record.object].push(record.role);
        return map;
      }, { });
    }
});

store.on('subject-role-map-request', function (cmd, cb) {
  var query = {
    'context': cmd.ctx.name,
    'object':  cmd.object || ''
  };

  collection
    .find(query)
    .toArray()
    .then(result => cb(null, transformResponse(result)))
    .catch(error => cb(error));

    function transformResponse(result) {
      return result.reduce((map, record) => {
          map[record.subject] || (map[record.subject] = [ ]);
          map[record.subject].push(record.role);
          return map;
      }, { });
    }
});

store.on('reset', function (cb) {
  collection
    .drop()
    .then(result => cb())
    .catch(error => cb(error));
});
