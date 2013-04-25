/*
 * users.js: Commands related to user resource.
 *
 */

var grr = require('../../grr'),
    utile = grr.common;

var _ = require('underscore');
_.mixin(require('underscore.string'));

var users = exports;

//
// ### function confirm (username, callback)
// #### @username {string} Desired username to confirm
// #### @callback {function} Continuation to pass control to when complete.
// Attempts to confirm the Wolfpack user account with the specified `username`.
// Prompts the user for additional `invite` information.
//
users.confirm = function (username, invite, callback) {

  // Allows arbitrary amount of arguments.
  if (arguments.length) {
    var args = utile.args(arguments);
    callback = args.callback;
    username = args[0] || null;
    invite = args[1] || null;
  }

  // Recursively get args if not already given.
  (function confirm(username, invite) {

    if (!username)
      return grr.prompt.get(['username'], function (err, result) {
        confirm(result.username, invite);
      });

    if (!invite)
      return grr.prompt.get(['invite code'], function (err, result) {
        confirm(username, result['invite code']);
      });

    var user = {
      username: username,
      invite: invite
    };

    grr.log.info('Confirming user ' + username.magenta);
    grr.users.confirm(user, function (err, response) {
      if (err)
        return callback(err);

      if (response.error) {
        grr.log.error(response.error);
        return callback(response.error);
      }

      grr.log.info('User ' + username.magenta + ' confirmed');
      grr.log.info('You may now run ' + 'grr login'.magenta);
      callback();
      
    });
  })(username, invite);

};

//
// Usage for `grr users confirm`.
//
users.confirm.usage = [
  'Confirms a Wolfpack user account',
  'Will prompt for a valid invite code for the account',
  '',
  'grr users confirm <username> <invitecode>'
];

//
// ### function confirm (username, callback)
// #### @username {string} Desired username to confirm
// #### @callback {function} Continuation to pass control to when complete.
// Attempts to confirm the Wolfpack user account with the specified `username`.
// Prompts the user for additional `invite` information.
//
users.list = function (callback) {

  // Allows arbitrary amount of arguments.
  if (arguments.length)
    var args = utile.args(arguments);

  grr.log.info('Fetching all users');
  grr.users.list(function (err, response) {
    if (err)
      return callback(err);

    if (response.error) {
      grr.log.error(response.error);
      return callback(response.error);
    }

    grr.log.info('Found ' + String(response.users.length).cyan + ' users');
    _.each(response.users, function (user) {
      grr.log.info(user.magenta);
    });
    
    callback();
    
  });

};

//
// Usage for `grr users list`.
//
users.list.usage = [
  'Shows all users',
  '',
  'grr users list'
];