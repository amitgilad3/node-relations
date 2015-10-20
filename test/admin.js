describe('admin role (array syntax)', function () {
  before(function () {
    //var redis = require('redis');
    //relations.use(relations.stores.redis, {client: redis.createClient()});
    relations.use(relations.stores.memory);
    relations.define('users');
    relations.users.addRole('admin', ['do stuff']);
  });

  after((next) => relations.tearDown().then(next));

  it('is carlos an admin', function (done) {
    relations.users('is %s an %s of %s?', ['carlos', 'admin', 'whoville'])
      .then(is => {
        assert(!is);
        done();
      })
      .catch(done);
  });

  it('carlos is an admin', function (done) {
    relations.users('%s is an %s of %s', ['carlos', 'admin', 'whoville'])
      .then(some => {
        done();
      })
      .catch(done);
  });

  it('is carlos an admin', function (done) {
    relations.users('is %s an %s of %s?', ['carlos', 'admin', 'whoville'])
      .then(is => {
        assert(is);
        done();
      })
      .catch(done);
  });

  it('carlos is not admin', function (done) {
    relations.users('%s is not an %s of %s', ['carlos', 'admin', 'whoville'])
      .then(some => {
        done();
      })
      .catch(done);
  });

  it('is carlos an admin', function (done) {
    relations.users('is %s an %s of %s?', ['carlos', 'admin', 'whoville'])
      .then(is => {
        assert(!is);
        done();
      })
      .catch(done);
  });
});

describe('admin role (object syntax)', function () {
  before(function () {
    //var redis = require('redis');
    //relations.use(relations.stores.redis, {client: redis.createClient()});
    relations.use(relations.stores.memory);
    relations.define('users');
    relations.users.addRole('admin', ['do stuff']);
  });

  after(relations.tearDown);

  it('is carlos an admin', function (done) {
    relations.users('is :user a :role of :object?', {user: 'carlos', role: 'admin', object: 'whoville'})
      .then(is => {
        assert(!is);
        done();
      })
      .catch(done);
  });

  it('carlos is an admin', function (done) {
    relations.users(':user is a :role of :object', {user: 'carlos', role: 'admin', object: 'whoville'})
      .then(some => {
        done();
      })
      .catch(done);
  });

  it('is carlos an admin', function (done) {
    relations.users('is :user a :role of :object?', {user: 'carlos', role: 'admin', object: 'whoville'})
      .then(is => {
        assert(is);
        done();
      })
      .catch(done);
  });

  it('carlos is not admin', function (done) {
    relations.users(':user is not a :role of :object', {user: 'carlos', role: 'admin', object: 'whoville'})
      .then(some => {
        done();
      })
      .catch(done);
  });

  it('is carlos an admin', function (done) {
    relations.users('is :user a :role of :object?', {user: 'carlos', role: 'admin', object: 'whoville'})
      .then(is => {
        assert(!is);
        done();
      })
      .catch(done);
    });
});

describe('admin role (literal syntax)', function () {
  before(function () {
    //var redis = require('redis');
    //relations.use(relations.stores.redis, {client: redis.createClient()});
    relations.use(relations.stores.memory);
    relations.define('users');
    relations.users.addRole('admin', ['do stuff']);
  });

  after(relations.tearDown);

  it('is carlos an admin', function (done) {
    relations.users('is carlos an admin of whoville')
      .then(is => {
        assert(!is);
        done();
      })
      .catch(done);
  });

  it('carlos is an admin', function (done) {
    relations.users('carlos is an admin of whoville')
      .then(some => {
        done();
      })
      .catch(done);
  });

  it('is carlos an admin', function (done) {
    relations.users('is carlos an admin of whoville')
      .then(is => {
        assert(is);
        done();
      })
      .catch(done);
  });

  it('carlos is not admin', function (done) {
    relations.users('carlos is not an admin of whoville')
      .then(some => {
        done();
      })
      .catch(done);
  });

  it('is carlos an admin', function (done) {
    relations.users('is carlos an admin of whoville')
      .then(is => {
        assert(!is);
        done();
      })
      .catch(done);
  });
});
