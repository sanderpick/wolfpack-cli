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
  'grr teams invite [<username>] [<teamname>]'
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
    grr.teams.available(n, function (err, result) {
      if (200 === result)
        return cb(null, n);
      grr.log.error('Name was already taken');
      grr.prompt.get(['name'], _.bind(callee, this, cb));
    });
  })(function (err, n) {
    grr.log.info('Creating team ' + n.magenta);
    grr.teams.create(n, {username: username}, callback);
  }, null, name);

};

//
// Usage for `grr apps create`.
//
teams.create.usage = [
  'Attempts to create a new team with name.',
  '',
  'grr teams create [<name>]'
];

//
// ### function invite (callback)
// #### @target {string|Object} **optional** Name of the application to create
// #### @callback {function} Continuation to pass control to when complete.
// Creates an application for the package.json in the current directory
// using `name` if supplied and falling back to `package.name`.
//
teams.invite = function (invitee, name, callback) {

  // Allows arbitrary amount of arguments.
  if (arguments.length)
    callback = utile.args(arguments).callback;

  var username = grr.config.get('username');
  grr.log.info('Inviting ' + invitee.magenta + ' to team ' + name.magenta);
  grr.teams.invite(name, {inviter: username, invitee: invitee}, callback);
};

//
// Usage for `grr teams invite`.
//
teams.invite.usage = [
  'Attempts to invite an existing user to an existing team.',
  '',
  'grr teams invite [<username>] [<teamname>]'
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

    grr.log.info('Found ' + String(response.teams.length).cyan + ' teams');
    _.each(response.teams, function (team) {
      grr.log.info(team.name.magenta);
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