/*
 * teams.js: Commands related to team resources
 *
 */

var analyzer = require('require-analyzer'),
    opener   = require('opener'),
    grr    = require('../../grr'),
    utile    = grr.common;
var _ = require('underscore');
_.mixin(require('underscore.string'));

var teams = exports;

teams.usage = [
  'The `grr teams` command manages',
  'Teams on Wolfpack. Valid commands are:',
  '',
  'grr teams create',
  'grr teams list',
  'grr teams add [<username>] [<teamname>]'
];

//
// ### function create (callback)
// #### @target {string|Object} **optional** Name of the application to create
// #### @callback {function} Continuation to pass control to when complete.
// Creates an application for the package.json in the current directory
// using `name` if supplied and falling back to `package.name`.
//
teams.create = function (name, callback) {

  // Allows arbitrary amount of arguments.
  if (arguments.length)
    callback = utile.args(arguments).callback;

  // Recursively check availability.
  var username = grr.config.get('username');
  (function (cb, err, n) {
    if (err) {
      grr.log.error('Error creating team ' + n.magenta);
      grr.log.error(err.message);
      return callback(err);    
    }
    var callee = arguments.callee;
    if (!n)
      return grr.prompt.get(['name'], _.bind(callee, this, cb));
    if (_.isObject(n)) n = n.name;
    grr.log.info('Checking team availability ' + n.magenta);
    grr.teams.available([username, n].join('/'), function (err, result) {
      if (200 === result)
        return cb(null, n);
      grr.log.error('Name was already taken');
      grr.prompt.get(['name'], _.bind(callee, this, cb));
    });
  })(function (err, n) {
    grr.log.info('Creating team ' + n.magenta);
    grr.teams.create([username, n].join('/'), callback);
  }, null, name);

};

//
// Usage for `jitsu apps create`.
//
teams.create.usage = [
  'Attempts to create a new team with name.',
  '',
  'jitsu teams create [<name>]'
];

//
// ### function add (callback)
// #### @target {string|Object} **optional** Name of the application to create
// #### @callback {function} Continuation to pass control to when complete.
// Creates an application for the package.json in the current directory
// using `name` if supplied and falling back to `package.name`.
//
teams.add = function (add, name, callback) {

  // Allows arbitrary amount of arguments.
  if (arguments.length)
    callback = utile.args(arguments).callback;

  var username = grr.config.get('username');
  var user = {
    username: add,
    updates: {daily: true, micro: false},
    recaps: {daily: true, weekly: true}
  };
  grr.log.info('Adding ' + add.magenta + ' to team ' + name.magenta);
  grr.teams.update([username, name].join('/'), user, callback);
};

//
// Usage for `jitsu teams add`.
//
teams.add.usage = [
  'Attempts to add a username to an existing team.',
  '',
  'jitsu teams add [<username>] [<teamname>]'
];

//
// ### function confirm (username, callback)
// #### @username {string} Desired username to confirm
// #### @callback {function} Continuation to pass control to when complete.
// Attempts to confirm the Wolfpack user account with the specified `username`.
// Prompts the user for additional `invite` information.
//
teams.list = function (callback) {

  // Allows arbitrary amount of arguments.
  if (arguments.length)
    var args = utile.args(arguments);

  var username = grr.config.get('username');
  grr.log.info('Fetching all teams for ' + username.magenta);
  grr.teams.list(username, function (err, response) {
    if (err)
      return callback(err);

    if (response.error) {
      grr.log.error(response.error);
      return callback(response.error);
    }

    _.each(response.teams, function (team) {
      grr.log.info(team.name.magenta);
      if (team.users)
        _.each(team.users, function (conf, un) {
          grr.log.info('  ' + un.cyan + ' -> '
                            + 'updates: '
                            + ((conf.updates.daily ? 'daily ':'')
                            + (conf.updates.micro ? 'micro ':'')
                            + (!conf.updates.daily && !conf.updates.micro ? 'none ':'')).bold
                            + '| recaps: '
                            + ((conf.recaps.daily ? 'daily ':'')
                            + (conf.recaps.weekly ? 'weekly ':'')
                            + (!conf.recaps.daily && !conf.recaps.weekly ? 'none ':'')).bold);
                            
        });
    });
    
    callback();
    
  });

};

//
// Usage for `grr teams list`.
//
teams.list.usage = [
  'Shows all teams for a certain user',
  '',
  'grr teams list'
];

//
// ### function list (callback)
// #### @callback {function} Continuation to pass control to when complete.
// Lists the teams for the authenticated user.
//
// teams.list = function (username, callback) {

//   var authuser = grr.config.get('username') || '';

//   if(arguments.length) {
//     var args = utile.args(arguments);
//     callback = args.callback;
//     username = args[0] || authuser;
//   }

//   if (authuser === '') {
//     return grr.commands.users.login(function (err) {
//       if (err) {
//         return callback(err);
//       }

//       grr.commands.teams.list(username, callback);
//     });
//   }

//   if (authuser === '') {
//     return grr.commands.users.login(function (err) {
//       if (err) {
//         return callback(err);
//       }

//       grr.commands.teams.list(username, callback);
//     });
//   }

//   grr.log.info('Listing all teams for ' + username.magenta);

//   grr.teams.list(username, function cb(err, teams) {
//     if (err) {
//       if (err.statusCode === 403) {
//         if (authuser === '') {
//           grr.log.error('You are not authorized to list application for user: ' + username.magenta);
//           grr.log.error('You need to login to do that!');
//         }
//         else {
//           grr.log.error(grr.config.get('username').magenta + ' is not authorized to list applications for user: ' + username.magenta);
//         }
//       }
//       return callback(err);
//     }

//     if (!teams || teams.length === 0) {
//       grr.log.warn('No applications exist.');
//       grr.log.help('Try creating one with ' + 'grr install'.magenta + ' and then deploy it with ' + 'grr deploy'.magenta);
//       return callback();
//     }

//     var rows = [['name', 'state', 'subdomain', 'drones', 'running snapshot']],
//         colors = ['underline', 'underline', 'underline', 'underline', 'underline'];

//     teams.forEach(function (app) {
//       app.state = grr.common.formatAppState(app.state);

//       //
//       // Remark: Attempt to always show running snapshot
//       //
//       var snapshot = '---';
//       if(app.running && app.running.filename) {
//         snapshot = app.running.filename;
//       }

//       rows.push([
//         app.name,
//         app.state,
//         app.subdomain,
//         app.drones + '/' + app.maxDrones,
//         snapshot
//       ]);
//     });

//     grr.inspect.putRows('data', rows, colors);
//     callback();
//   });
// };