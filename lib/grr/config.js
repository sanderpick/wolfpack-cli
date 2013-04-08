/*
 * config.js: Configuration for the grr CLI.
 *
 */

var path = require('path'),
    fs = require('fs'),
    grr = require('../grr');

//
// Store the original `grr.config.load()` function
// for later use.
//
var _load = grr.config.load;

//
// Update env if using Windows
//
if (process.platform == "win32") {
  process.env.HOME = process.env.USERPROFILE;
}

//
// Setup target file for `.grrconf`.
//
//
// TODO: Refactor broadway to emit `bootstrap:after` and put this 
//       code in a handler for that event
//
try {
  grr.config.file({
    file: grr.argv.grrconf || grr.argv.j || '.grrconf',
    dir: process.env.HOME,
    search: true
  });
}
catch (err) {
  console.log('Error parsing ' + grr.config.stores.file.file.magenta);
  console.log(err.message);
  console.log('');
  console.log('This is most likely not an error in grr');
  console.log('Please check the .grrconf file and try again');
  console.log('');
  process.exit(1);
}


var defaults = {
  name: 'grr',
  analyze: true,
  release: 'build',
  colors: true,
  loglevel: 'info',
  loglength: 110,
  protocol: 'http',
  localHost: 'localhost',
  localPort: 9090,
  remoteHost: 'api.grr.io',
  requiresAuth: ['teams'],
  root: process.env.HOME,
  timeout: 4 * 60 * 1000,
  tmproot: path.join(process.env.HOME, '.grr/tmp'),
  userconfig: '.grrconf'
};

Object.defineProperty(defaults, 'remoteUri', {
  get: function () {
    var dev = grr.config.get('dev');
    var port = dev ? grr.config.get('localPort') || ''
                   : grr.config.get('port') || '';
    if (port) {
      port = ':' + port;
    }
    var host = dev ? grr.config.get('localHost')
                   : grr.config.get('remoteHost');
    return [grr.config.get('protocol'), '://', host, port].join('');
  }
});

//
// Set defaults for `grr.config`.
//
grr.config.defaults(defaults);

//
// Use the `flatiron-cli-config` plugin for `grr config *` commands
//
grr.use(require('flatiron-cli-config'), {
  store: 'file',
  restricted: [
    'auth', 
    'root', 
    'remoteUri', 
    'tmproot', 
    'userconfig'
  ],
  before: {
    list: function () {
      var username = grr.config.get('username'),
          configFile = grr.config.stores.file.file;

      var display = [
        ' here is the ' + configFile.grey + ' file:',
        'To change a property type:',
        'grr config set <key> <value>',
      ];

      if (!username) {
        grr.log.warn('No user has been setup on this machine');
        display[0] = 'Hello' + display[0];
      }
      else {
        display[0] = 'Hello ' + username.green + display[0];
      }

      display.forEach(function (line) {
        grr.log.help(line);
      });

      return true;
    }
  }
});

//
// Override `grr.config.load` so that we can map
// some existing properties to their correct location.
//
grr.config.load = function (callback) {
  _load.call(grr.config, function (err, store) {
    if (err) {
      return callback(err, true, true, true);
    }

    grr.config.set('userconfig', grr.config.stores.file.file);
    
    if (store.auth) {
      var auth = store.auth.split(':');
      grr.config.clear('auth');
      grr.config.set('username', auth[0]);
      grr.config.set('password', auth[1]);
      return grr.config.save(callback);
    }

    callback(null, store);
  });
};
