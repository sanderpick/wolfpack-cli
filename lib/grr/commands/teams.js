/*
 * teams.js: Commands related to team resources.
 *
 */

var analyzer = require('require-analyzer');
var opener = require('opener');
var grr = require('../../grr');
var utile = grr.common;
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


/*
 * Creates a new team.
 * @name {string} **optional** Name of the team to create
 * @cb {function} Continuation to pass control to when complete.
 */
teams.create = function (name, cb) {

  // Allows arbitrary amount of arguments.
  if (arguments.length)
    cb = utile.args(arguments).cb;

  // Recursively check availability.
  var username = grr.config.get('username');
  (function (cb, err, n) {
    if (err) {
      grr.log.error('Error creating team ' + n.magenta);
      grr.log.error(err.message);
      return cb(err);    
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
    grr.teams.create(n, {username: username}, cb);
  }, null, name);

};

// Usage for `grr apps create`.
teams.create.usage = [
  'Creates a new team with name.',
  '',
  'grr teams create [<name>]'
];

/* 
 * Invites a user to a team.
 * @invitee {string} Username of the user to invite.
 * @cb {function} Continuation to pass control to when complete.
 */
teams.invite = function (invitee, name, cb) {

  // Allows arbitrary amount of arguments.
  if (arguments.length)
    cb = utile.args(arguments).cb;

  var username = grr.config.get('username');
  grr.log.info('Inviting ' + invitee.magenta + ' to team ' + name.magenta);
  grr.teams.invite(name, {inviter: username, invitee: invitee}, cb);
};

// Usage for `grr teams invite`.
teams.invite.usage = [
  'Invites an existing user to an existing team.',
  '',
  'grr teams invite [<username>] [<teamname>]'
];

/* 
 * Lists all teams that the logged in user is a member of.
 * @cb {function} Continuation to pass control to when complete.
 */
teams.list = function (cb) {

  // Allows arbitrary amount of arguments.
  if (arguments.length)
    var args = utile.args(arguments);

  var username = grr.config.get('username');
  grr.log.info('Fetching all teams for ' + username.magenta);
  grr.teams.list(username, function (err, response) {
    if (err)
      return cb(err);

    if (response.error) {
      grr.log.error(response.error);
      return cb(response.error);
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
    
    cb();
    
  });

};

// Usage for `grr teams list`.
teams.list.usage = [
  'Shows all teams for the user',
  '',
  'grr teams list'
];