const assert    = require('assert');
const util      = require('util');
const relations = require('../');

describe('restricted permissions (only for mongodb)', function () {
  before(function () {
    var MongoClient = require('mongodb').MongoClient;
    relations.use(relations.stores.mongodb, { client: MongoClient.connect('mongodb://travis:test@localhost:27017/relations_test') });

    relations.define('repos');
    relations.repos.addRole('owner',   [ 'pull', 'push',  'comment' ]);
    relations.repos.addRole('banned',  [ '!push', '!comment' ]);
    relations.repos.addRole('watcher', [ 'pull', 'comment' ]);
    relations.repos.addRole('default', [ 'pull', 'comment' ]);

    relations.repos(':person is the owner of :repo',  { person: 'den', repo: 'his-repo'   });
    relations.repos(':person is the owner of :repo',  { person: 'anh', repo: 'other-repo' });

    relations.repos(':person is a watcher of :repo',  { person: 'den',    repo: 'other-repo' });
    relations.repos(':person is a banned from :repo', { person: 'den',    repo: 'other-repo' });
    relations.repos(':person is a banned from :repo', { person: 'istvan', repo: 'other-repo' });
  });

  after(next => {
    relations.tearDown().then(result => next());
  });

  it('den should be able to push to his repo', done => {
    relations.repos('can den push to his-repo?')
      .then(answer => {
        assert(answer === true);
        done();
      })
      .catch(done);
  });

  it('den should not be able to push to other repo', done => {
    relations.repos('can den push to other-repo?')
      .then(answer => {
        assert(answer === false);
        done();
      })
      .catch(done);
  });

  it('den should not be able to comment in other repo', done => {
    relations.repos('can den comment in other-repo?')
      .then(answer => {
        assert(answer === false);
        done();
      })
      .catch(done);
  });

  it('what can den comment?', done => {
    relations.repos('what can den comment?')
      .then(answer => {
        assert.deepEqual(answer, [ 'his-repo' ]);
        done();
      })
      .catch(done);
  });

  it('who can comment at other-repo?', done => {
    relations.repos('who can comment in other-repo?')
      .then(answer => {
        assert.deepEqual(answer, [ 'anh' ]);
        done();
      })
      .catch(done);
  });

  it('what actions can den do with other-repo?', done => {
    relations.repos('what actions can den do with other-repo?')
      .then(answer => {
        assert.deepEqual(answer, [ 'pull' ]);
        done();
      })
      .catch(done);
  });

  it('istvan should not be able to push to other repo', done => {
    relations.repos('can istvan push to other-repo?')
      .then(answer => {
        assert(answer === false);
        done();
      })
      .catch(done);
  });

  it('istvan should not be able to comment in other repo', done => {
    relations.repos('can istvan comment in other-repo?')
      .then(answer => {
        assert(answer === false);
        done();
      })
      .catch(done);
  });

  it('what can istvan comment?', done => {
    relations.repos('what can istvan comment?')
      .then(answer => {
        assert.deepEqual(answer, [ ]);
        done();
      })
      .catch(done);
  });

  it('what actions can istvan do with other-repo?', done => {
    relations.repos('what actions can istvan do with other-repo?')
      .then(answer => {
        assert.deepEqual(answer, [ ]);
        done();
      })
      .catch(done);
  });
});
