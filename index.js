var relations = module.exports = { }
  , Promise = require('bluebird')
  , parser = require('./parser')
  , Context = require('./context')
  , currentQueue = new (require('./queue'))()

relations.define = function (name, structure) {
  var ctx = new Context(name, structure);

  relations[name] = function (expression) {
    var args    = [].slice.call(arguments, 1);
    var command = null;

    return Promise.resolve(expression)
      .then(expression => parseExpression(expression, ctx))
      .then(result     => {
        command = result;
        return parseArguments(args);
      })
      .then(args   => fillReplacements(args, expression, ctx, command))
      .then(result => currentQueue.push(executeCommand(command)))
  };

  ['addRole', 'updateRole', 'removeRole', 'getRoles'].forEach(function (method) {
    relations[name][method] = ctx[method].bind(ctx);
  });
};

relations.stores = {
  memory: require('./stores/memory'),
  mysql: require('./stores/mysql'),
  redis: require('./stores/redis')
};

relations.use = function (store, options) {
  Promise.promisifyAll(store);
  relations.store = store;

  store.invokeAsync('init', options || {}).then(() => currentQueue.run());
};

relations.tearDown = function () {
  var oldStore = relations.store;

  relations.store = null;
  currentQueue.reset();

  if (oldStore.listeners('reset').length) {
    return oldStore.invokeAsync('reset');
  }

  return Promise.resolve();
};

function parseExpression (expression, context) {
    if (!expression) {
      throw Error('must pass a string to parse');
    }

    var command = parser.parse(expression);
    command.ctx = context;

    return command;
}

function parseArguments (args) {
  var unnamed, named;

  do {
    var arg = args.shift();
    if (Array.isArray(arg)) {
      unnamed = arg;
    }
    else if (typeof arg === 'object') {
      named = arg;
    }
    else if (typeof arg === 'string' || typeof arg === 'number') {
      unnamed || (unnamed = []);
      unnamed.push(arg);
    }
  } while (args.length);

  if (named && unnamed) {
    throw new Error('cannot mix named and unnamed tokens');
  }

  return {
    named:   named,
    unnamed: unnamed
  };
}

function fillReplacements (args, expression, context, cmd) {
  ['subject', 'role', 'verb', 'object'].forEach(function (k) {
    if (cmd[k]) {
      if (cmd[k].name) {
        if (typeof args.named[cmd[k].name] === 'undefined') {
          throw new Error('no data for named token :' + cmd[k].name);
        }
        cmd[k] = args.named[cmd[k].name];
      }
      else if (cmd[k].type) {
        if (typeof args.unnamed[cmd[k].index] === 'undefined') {
          throw new Error('no data for unnamed token (index: ' + cmd[k].index + ')');
        }
        cmd[k] = args.unnamed[cmd[k].index];
        if (cmd[k].type === 'number') {
          cmd[k] = parseFloat(cmd[k]);
        }
      }
      else if (cmd[k].value) {
        cmd[k] = cmd[k].value;
      }
      else {
        throw new Error('weird error parsing "' + expression + '"');
      }

      if (k === 'role' && !context.roles[cmd.role]) {
        throw new Error('role not defined: "' + cmd.role + '"');
      }
      else
      if (k === 'verb' && !context.verbs[cmd.verb]) {
        throw new Error('verb not defined: "' + cmd.verb + '"');
      }
    }
  });
}

function executeCommand (command) {
  if (!relations.store) {
    throw new Error('You should set a store first!');
  }

  return () => {
    return relations.store.invokeAsync(command.type, command);
  };
}
