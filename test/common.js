assert = require('assert');

util = require('util');

relations = require('../');

doBasicTest = function (store, options) {
  var carlos = 'carlos8f'
    , brian = 'cpsubrian'
    , sagar = 'astrosag_ngc4414'

  // repos
  var buffet = 'carlos8f/node-buffet'
    , views = 'cpsubrian/node-views'

  // Sort a map's values array so that we can use assert.deepEquals
  var sortedMap = function (map) {
    return Object.keys(map).reduce(function (sorted, key) {
      sorted[key] = map[key].sort();
      return sorted;
    }, {});
  }

  before(function () {
    if (store) {
      relations.use(relations.stores[store], options);
    }
    relations.define('repos');
    relations.repos.addRole('owner', ['pull', 'push', 'administrate']);
    relations.repos.addRole('collaborator', ['pull', 'push']);
    relations.repos.addRole('watcher', ['pull']);

    relations.repos('%s is the owner of %s', carlos, buffet);
    relations.repos('%s is a collaborator of %s', carlos, views);
    relations.repos('%s is a watcher', carlos);
    relations.repos(':user is the "owner" of :repo', {user: brian, repo: views});
    relations.repos('%s is a watcher', brian);
    relations.repos('%s is a watcher', sagar);
  });

  after(next => relations.tearDown().then(next));

  it('can brian administrate views', function (done) {
    relations.repos('can :user administrate :repo?', {user: brian, repo: views})
      .then(can => {
        assert(can);
        done();
      })
      .catch(done);
  });

  it('can carlos push to views', function (done) {
    relations.repos('can %s push to %s', [carlos, views])
      .then(can => {
        assert(can);
        done();
      })
      .catch(done);
  });

  it('can sagar pull from views', function (done) {
    relations.repos('can %s pull from cpsubrian/node-views?', sagar)
      .then(can => {
        assert(can);
        done();
      })
      .catch(done);
  });

  it('can sagar pull', function (done) {
    relations.repos('can %s pull?', sagar)
      .then(can => {
        assert(can);
        done();
      })
      .catch(done);
  });

  it('is brian a collaborator of buffet', function (done) {
    relations.repos('is %s a collaborator of "' + buffet + '"?', brian)
      .then(is => {
        assert(!is);
        done();
      })
      .catch(done);
  });

  it('is sagar a watcher', function (done) {
    relations.repos('is ' + sagar + ' a watcher?')
      .then(is => {
        assert(is);
        done();
      })
      .catch(done);
  });

  it('what can carlos pull from', function (done) {
    relations.repos('what can %s pull from?', carlos)
      .then(list => {
        assert.deepEqual(list.sort(), [buffet, views].sort());
        done();
      })
      .catch(done);
  });

  it('what can brian administrate', function (done) {
    relations.repos('what can %s administrate', brian)
      .then(list => {
        assert.deepEqual(list, [views]);
        done();
      })
      .catch(done);
  });

  it('what can sagar pull from', function (done) {
    relations.repos('what can %s pull from', sagar)
      .then(list => {
        assert.deepEqual(list, []);
        done();
      })
      .catch(done);
  });

  it('what is carlos a collaborator of', function (done) {
    relations.repos('what is %s a collaborator of', carlos)
      .then(list => {
        assert.deepEqual(list, [views]);
        done();
      })
      .catch(done);
  });

  it('who is the owner of views?', function (done) {
    relations.repos('who is the owner of %s?', views)
      .then(list => {
        assert.deepEqual(list, [brian]);
        done();
      })
      .catch(done);
  });

  it('who can pull from views?', function (done) {
    relations.repos('who can pull from %s?', views)
      .then(list => {
        assert.deepEqual(list, [carlos, brian]);
        done();
      })
      .catch(done);
  });

  it('carlos is not a collaborator of views', function (done) {
    relations.repos('%s is not a collaborator of %s', [carlos, views]);
    relations.repos('can %s push to %s', carlos, views)
      .then(can => {
        assert(!can);
        done();
      })
      .catch(done);
  });

  it('add owner role throws', function (done) {
    assert.throws(function () {
      relations.repos.addRole('owner', ['pull', 'push', 'administrate']);
    }, function (err) {
      return err.code === 'ER_DUP_ROLE';
    });
    done();
  });

  it('redefine owner', function (done) {
    relations.repos.updateRole('owner', ['pull', 'push', 'administrate', 'absquatulate']);
    done();
  });

  it('can carlos absquatulate buffet?', function (done) {
    relations.repos('can %s absquatulate %s?', carlos, buffet)
      .then(can => {
        assert(can);
        done();
      })
      .catch(done);
  });

  it('what can carlos absquatulate?', function (done) {
    relations.repos('what can %s absquatulate?', carlos)
      .then(list => {
        assert.deepEqual(list [buffet]);
        done();
      })
      .catch(done);
  });

  it('can brian absquatulate buffet?', function (done) {
    relations.repos('can %s absquatulate %s?', brian, buffet)
      .then(can => {
        assert(!can);
        done();
      })
      .catch(done);
  });

  it('add scientist', function (done) {
    relations.repos.addRole('scientist', ['test']);
    relations.repos('%s is a scientist', sagar).then(done);
  });

  it('can sagar test views?', function (done) {
    relations.repos('can %s test %s?', sagar, views)
      .then(can => {
        assert(can);
        done();
      })
      .catch(done);
  });

  it('can brian test views?', function (done) {
    relations.repos('can %s test %s?', brian, views)
      .then(can => {
        assert(!can);
        done();
      })
      .catch(done);
  });

  it('remove scientist', function (done) {
    relations.repos.removeRole('scientist');
    done();
  });

  it('can sagar test views?', function (done) {
    relations.repos('can %s test %s?', sagar, views)
      .catch(err => {
        assert(err);
        assert.equal(err.message, 'verb not defined: "test"');
        done();
      });
  });

  it('what roles can absquatulate?', function (done) {
    var roles = relations.repos.getRoles('absquatulate');
    assert(roles);
    assert.equal(roles.length, 1);
    assert.equal(roles[0], 'owner');
    done();
  });

  it('what actions can carlos do with buffet', function (done) {
    relations.repos('what actions can %s do with %s?', carlos, buffet)
      .then(verbs => {
        assert.equal(verbs.length, 4);
        assert.equal(verbs[0], 'pull');
        assert.equal(verbs[1], 'push');
        assert.equal(verbs[2], 'administrate');
        assert.equal(verbs[3], 'absquatulate');
        done();
      })
      .catch(done);
  });

  it('who can administrate buffet', function (done) {
    relations.repos('who can administrate %s', buffet)
      .then(list => {
        assert.deepEqual(list, [carlos]);
        done();
      })
      .catch(done);
  });

  it('describe what carlos can do', function (done) {
    relations.repos('describe what %s can do', carlos)
      .then(map => {
        assert.deepEqual(map, {
          '': [ 'watcher' ],
          'carlos8f/node-buffet': [ 'owner' ]
        });
        done();
      })
      .catch(done);
  });

  it('explain who can act on buffet', function (done) {
    relations.repos('explain who can act on %s', buffet)
      .then(map => {
        assert.deepEqual(map, {
          'carlos8f': [ 'owner' ]
        });
        done();
      })
      .catch(done);
  });

  it('get who can act', function (done) {
    relations.repos('detail who can act')
      .then(map => {
        assert.deepEqual(map, {
          'carlos8f': [ 'watcher' ],
          'cpsubrian': [ 'watcher' ],
          'astrosag_ngc4414': [ 'watcher', 'scientist' ]
        });
        done();
      })
      .catch(done);
  });

};
