describe('default role (only for mongodb)', function () {
  before(function () {
    var MongoClient = require('mongodb').MongoClient;
    relations.use(relations.stores.mongodb, { client: MongoClient.connect('mongodb://travis:test@localhost:27017/relations_test') });

    relations.define('users', {
      'admin':   ['create'],
      'owner':   ['edit'],
      'default': ['read']
    });

    relations.users('den is an admin');
    relations.users('anh is owner of :page', { page: 'main page' });
    relations.users('istvan is owner of :page', { page: 'contacts page' });
  });

  after(next => {
    relations.tearDown().then(result => next());
  });

  it('can den create a new page?', function (done) {
    relations.users('can den create :page?', { page: 'product page' })
      .then(answer => {
        assert(answer);
        done();
      })
      .catch(done);
  });

  it('can den read page?', function (done) {
    relations.users('can den read :page?', { page: 'main page' })
      .then(answer => {
        assert(!answer);
        done();
      })
      .catch(done);
  });

  it('can anh edit own page?', function (done) {
    relations.users('can anh edit :page?', { page: 'main page' })
      .then(answer => {
        assert(answer);
        done();
      })
      .catch(done);
  });

  it('can anh edit another page?', function (done) {
    relations.users('can anh edit :page?', { page: 'contacts page' })
      .then(answer => {
        assert(!answer);
        done();
      })
      .catch(done);
  });

  it('can anh read another page?', function (done) {
    relations.users('can anh read :page?', { page: 'contacts page' })
      .then(answer => {
        assert(answer);
        done();
      })
      .catch(done);
  });

  it('can other user read some page?', function (done) {
    relations.users('can thorsten read :page?', { page: 'main page' })
      .then(answer => {
        assert(answer);
        done();
      })
      .catch(done);
  })

  it('can anh read own page?', function (done) {
    relations.users('can anh read :page?', { page: 'main page' })
      .then(answer => {
        assert(!answer);
        done();
      })
      .catch(done);
  });

  it('can istvan read?', function (done) {
    relations.users('can istvan read?')
      .then(answer => {
        assert(answer);
        done();
      })
      .catch(done);
  });

  it('is istvan a default?', function (done) {
    relations.users('is istvan a default?')
      .then(answer => {
        assert(!answer);
        done();
      })
      .catch(done);
  });

  it('what actions can istvan do with main page?', function (done) {
    relations.users('what actions can istvan do with :page?', { page: 'main page' })
      .then(list => {
        assert.deepEqual(list, [ 'read' ]);
        done();
      })
      .catch(done);
  });
});
