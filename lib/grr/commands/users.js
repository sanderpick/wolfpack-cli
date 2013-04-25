/*
 * users.js: Commands related to user resource.
 *
 */

var grr = require('../../grr');
var utile = grr.common;

var _ = require('underscore');
_.mixin(require('underscore.string'));

var users = exports;

/* 
 * Attempts to confirm the user account with the specified `username`.
 * Prompts the user for `invite` if needed.
 * @username {string} Desired username to confirm.
 * @invite {string} Invite code sent in welcome email.
 * @cb {function} Continuation to pass control to when complete.
 */
users.confirm = function (username, invite, cb) {

  // Allows arbitrary amount of arguments.
  if (arguments.length) {
    var args = utile.args(arguments);
    cb = args.cb;
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
        return cb(err);

      if (response.error) {
        grr.log.error(response.error);
        return cb(response.error);
      }

      grr.log.info('User ' + username.magenta + ' confirmed');
      grr.log.info('You may now run ' + 'grr login'.magenta);
      cb();
      
    });
  })(username, invite);

};


// Usage for `grr users confirm`.
users.confirm.usage = [
  'Confirms a Wolfpack user account',
  'Will prompt for a valid invite code for the account',
  '',
  'grr users confirm <username> <invitecode>'
];


/* 
 * Lists all users.
 * @cb {function} Continuation to pass control to when complete.
 */
users.list = function (cb) {

  // Allows arbitrary amount of arguments.
  if (arguments.length)
    var args = utile.args(arguments);

  grr.log.info('Fetching all users');
  grr.users.list(function (err, response) {
    if (err)
      return cb(err);

    if (response.error) {
      grr.log.error(response.error);
      return cb(response.error);
    }

    grr.log.info('Found ' + String(response.users.length).cyan + ' users');
    _.each(response.users, function (user) {
      grr.log.info(user.magenta);
    });
    
    cb();
    
  });

};

// Usage for `grr users list`.
users.list.usage = [
  'Shows all users',
  '',
  'grr users list'
];