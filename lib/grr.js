/*
 * grr.js: Top-level include for the grr module.
 *
 */

var path = require('path'),
    util = require('util'),
    colors = require('colors'),
    flatiron = require('flatiron');

var grr = module.exports = flatiron.app;

//
// Setup `grr` to use `pkginfo` to expose version
//
require('pkginfo')(module, 'name', 'version');

//
// Configure grr to use `flatiron.plugins.cli`
//
grr.use(flatiron.plugins.cli, {
  version: true,
  usage: require('./grr/usage'),
  source: path.join(__dirname, 'grr', 'commands'),
  argv: {
    version: {
      alias: 'v',
      description: 'print grr version and exit',
      string: true
    },
    localconf: {
      description: 'search for .grrconf file in ./ and then parent directories',
      string: true
    },
    grrconf: {
      alias: 'g', 
      description: 'specify file to load configuration from',
      string: true
    },
    noanalyze: {
      description: 'skip require-analyzer: do not attempt to dynamically detect dependencies',
      boolean: true
    },
    colors: {
      description: '--no-colors will disable output coloring',
      default: true,
      boolean: true
    },
    confirm: {
      alias: 'c',
      description: 'prevents grr from asking before overwriting/removing things',
      default: false,
      boolean: true
    },
    release: {
      alias: 'r',
      description: 'specify release version number or semantic increment (build, patch, minor, major)',
      string: true
    },
    raw: {
      description: 'grr will only output line-delimited raw JSON (useful for piping)',
      boolean: true
    }
  }
});

grr.options.log = {
  console: {
    raw: grr.argv.raw
  }
};

//
// Setup config, users, command aliases and prompt settings
//
grr.prompt.properties = flatiron.common.mixin(
  grr.prompt.properties, 
  require('./grr/properties')
);
grr.prompt.override   = grr.argv;
require('./grr/config');
require('./grr/alias');
require('./grr/commands');

//
// Setup other grr settings.
//
grr.started = false;
grr.common = require('./grr/common');
grr.logFile = new (require('./grr/common/logfile').LogFile)(path.join(process.env.HOME, '.grrlog'));

//
// Hoist `grr.api` from `api`.
//
grr.api = {};
grr.api.Client = require('./api/client').Client;
grr.api.Teams = require('./api/client').Teams;
grr.api.Users = require('./api/client').Users;

//
// ### function welcome ()
// Print welcome message.
//
grr.welcome = function () {
  //
  // If a user is logged in, show username
  //
  var username = grr.config.get('username') || '';
  grr.log.info('Welcome to ' + 'Wolfpack'.grey + ' ' + username.magenta);
  grr.log.info('grr v' + grr.version + ', node ' + process.version);
  grr.log.info('It worked if it ends with ' + 'Wolfpack'.grey + ' ok'.green.bold);
};

//
// ### function start (command, callback)
// #### @command {string} Command to execute once started
// #### @callback {function} Continuation to pass control to when complete.
// Starts the grr CLI and runs the specified command.
//
grr.start = function (callback) {  
  //
  // Check for --no-colors/--colors option, without hitting the config file
  // yet
  //
  var useColors = (typeof grr.argv.colors == 'undefined' || grr.argv.colors);

  useColors || (colors.mode = "none");

  //
  // whoami command should not output anything but username
  //
  if (grr.argv._[0] === "whoami") {
    console.log(grr.config.get('username') || '');
    return;
  }

  grr.common.checkVersion(function (err) {
    if (err) {
      return callback();
    }
    
    grr.init(function (err) {
      if (err) {
        grr.welcome();
        callback(err);
        return grr.showError(grr.argv._.join(' '), err);
      }

      //
      // --no-colors option turns off output coloring, and so does setting
      // colors: false in ~/.grrconf (see
      // https://github.com/nodejitsu/jitsu/issues/101 )
      //
      if ( !grr.config.get('colors') || !useColors ) {
        colors.mode = "none";
        grr.log.get('default').stripColors = true;
        grr.log.get('default').transports.console.colorize = false;
      }

      grr.welcome();

      var username = grr.config.get('username');
      if (!username && grr.config.get('requiresAuth').indexOf(grr.argv._[0]) !== -1) {
        return grr.commands.users.login(function (err) {
          if (err) {
            callback(err);
            return grr.showError(grr.argv._.join(' '), err);
          }

          var username = grr.config.get('username');
          grr.log.info('Successfully configured user ' + username.magenta);
          return grr.exec(grr.argv._, callback);
        });
      }
      return grr.exec(grr.argv._, callback);
    });
  });
};

//
// ### function exec (command, callback)
// #### @command {string} Command to execute
// #### @callback {function} Continuation to pass control to when complete.
// Runs the specified command in the grr CLI.
//
grr.exec = function (command, callback) {
  function execCommand (err) {
    if (err) {
      return callback(err);
    }

    //
    // Remark: This is a temporary fix for aliasing init=>install,
    // was having a few issues with the alias command on the install resource
    //
    if (command[0] === 'init') {
      command[0] = 'install';
    }

    // Alias db to databases
    if (command[0] === 'db' || command[0] === 'dbs' || command[0] === 'database') {
      command[0] = 'databases';
    }

    // Allow `grr logs` as a shortcut for `grr logs app`
    if (command[0] === 'logs' && command.length === 1) {
      command[1] = 'app';
    }

    grr.log.info('Executing command ' + command.join(' ').magenta);
    grr.router.dispatch('on', command.join(' '), grr.log, function (err, shallow) {
      if (err) {
        callback(err);
        return grr.showError(command.join(' '), err, shallow);
      }

      //
      // TODO (indexzero): Something here
      //
      callback();
    });
  }

  return !grr.started ? grr.setup(execCommand) : execCommand();
};

//
// ### function setup (callback)
// #### @callback {function} Continuation to pass control to when complete.
// Sets up the instances of the Resource clients for grr.
// there is no io here, yet this function is ASYNC.
//
grr.setup = function (callback) { 
  if (grr.started === true) {
    return callback();
  }

  ['Teams', 'Users'].forEach(function (key) {
    var k = key.toLowerCase();
    grr[k] = new grr.api[key](grr.config);
    grr[k].on('debug::request',  debug);
    grr[k].on('debug::response', debug);
    function debug (data) {
      if (grr.argv.debug || grr.config.get('debug')) {
        if (data.headers && data.headers['Authorization']) {
          data = JSON.parse(JSON.stringify(data));
          data.headers['Authorization'] = Array(data.headers['Authorization'].length).join('*');
        }

        util.inspect(data, false, null, true).split('\n').forEach(grr.log.debug);
      }
    };
  });

  grr.started = true;
  callback();
};

//
// ### function showError (command, err, shallow, skip)
// #### @command {string} Command which has errored.
// #### @err {Error} Error received for the command.
// #### @shallow {boolean} Value indicating if a deep stack should be displayed
// #### @skip {boolean} Value indicating if this error should be forcibly suppressed.
// Displays the `err` to the user for the `command` supplied.
//
grr.showError = function (command, err, shallow, skip) {
  var username,
      stack;

  if (err.statusCode === 403) {
    //grr.log.error('403 ' + err.result.error);
  }
  else if (err.statusCode === 503) {
    if (err.result && err.result.message) {
      grr.log.error(err.result.message);
    }
    else {
      grr.log.error('The Wolfpack cloud is currently at capacity.  Please try again later.');
    }
  }
  else if (!skip) {
    grr.log.error('Error running command ' + command.magenta);
    
    if (!grr.config.get('nolog')) {
      grr.logFile.log(err);
    }

    if (err.message) {
      grr.log.error(err.message);
    }

    if (err.result) {
      if (err.result.error) {
        grr.log.error(err.result.error);
      }

      if (err.result.result && err.result.result.error) {
        if (err.result.result.error.stderr || err.result.result.error.stdout) {
          grr.log.error('');
          grr.log.error('There was an error while attempting to start the app');
          grr.log.error(err.result.result.error.message);
          if (err.result.result.error.blame) {
            grr.log.error(err.result.result.error.blame.message);
            grr.log.error('');
            grr.log.error('This type of error is usually a ' + err.result.result.error.blame.type + ' error.');
          }
          
          grr.log.error('Error output from app:');
          grr.log.error('');
          if (err.result.result.error.stdout) {
            err.result.result.error.stdout.split('\n').forEach(function (line) {
              grr.log.error(line);
            });
          }
          
          if (err.result.result.error.stderr) {
            err.result.result.error.stderr.split('\n').forEach(function (line) {
              grr.log.error(line);
            });
          }
        }
        else if (err.result.result.error.stack) {
          grr.log.error('There was an error while attempting to deploy the app');
          grr.log.error('');
          grr.log.error(err.result.result.error.message);
          
          if (err.result.result.error.blame) {
            grr.log.error(err.result.result.error.blame.message);
            grr.log.error('');
            grr.log.error('This type of error is usually a ' + err.result.result.error.blame.type + ' error.');
          } 
          
          grr.log.error('Error output from Haibu:');
          grr.log.error('');
          stack = err.result.result.error.result || err.result.result.error.stack;
          stack.split('\n').forEach(function (line) {
            grr.log.error(line);
          });
        }
      }
      else if (err.result.stack) {
        grr.log.warn('Error returned from Wolfpack');
        err.result.stack.split('\n').forEach(function (line) {
          grr.log.error(line);
        });
      }
    }
    else {
      if (err.stack && !shallow) {
        if(err.message && err.message === 'socket hang up'){
          if (err.code){
            grr.log.info('');
            if (err.code === 'ECONNRESET'){
              grr.log.info(
                'grr\'s client request timed out before the server ' +
                'could respond'
              );
              grr.log.help(
                'This error may be due to network connection problems'
              );
            } else {
              grr.log.info('The nodegrr api reset the connection');
              grr.log.help(
                'This error may be due to the application or the drone server'
              );
            }

          }
        } else {
          err.stack.split('\n').forEach(function (trace) {
            grr.log.error(trace);
          });
        }
      }
    }
  }
  grr.log.help("For help with this error contact Wolfpack Support:");
  grr.log.help("  webchat: <http://webchat.grr.io/>");
  grr.log.help("      irc: <irc://chat.freenode.net/#wolfpack>");
  grr.log.help("    email: <support@grr.io>");
  grr.log.help("");
  grr.log.help("  Copy and paste this output to a gist (http://gist.github.com/)");
  grr.log.info('Wolfpack '.grey + 'not ok'.red.bold);
};
