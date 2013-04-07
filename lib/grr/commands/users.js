/*
 * users.js: Commands related to user resource.
 *
 */

var grr = require('../../grr'),
    users = exports,
    utile = grr.common;

//
// ### function confirm (username, callback)
// #### @username {string} Desired username to confirm
// #### @callback {function} Continuation to pass control to when complete.
// Attempts to confirm the Wolfpack user account with the specified `username`.
// Prompts the user for additional `inviteCode` information.
//
users.confirm = function (username, inviteCode, callback) {
  //
  // Allows arbitrary amount of arguments
  //
  if(arguments.length) {
    var args   = utile.args(arguments);
    callback   = args.callback;
    username   = args[0] || null;
    inviteCode = args[1] || null;
  }

  //
  // This is like setupUserNoWarn except that it only asks for your password.
  //
  function setupUserNoUsername(callback) {
    //
    // Attempt to get the password three times.
    //
    var tries = 0;

    function offerReset (username) {
      grr.prompt.get(['reset'], function (err, res) {
        if (err) {
          return callback(err);
        }
        if (/^y[es]+/i.test(res['request password reset'])) {
          return grr.plugins.cli.executeCommand(['users', 'forgot', username ], callback);
        }

        callback(new Error('Invalid username / password.'));
      });
    }

    (function setupAuth () {
      grr.prompt.get(['password'], function (err, result) {
        if (err) {
          return callback(err);
        }

        grr.config.set('username', username);
        grr.config.set('password', result.password);
        grr.setup(function () {
          grr.auth(function (err) {
            //
            // Increment the auth attempts
            //
            tries += 1;

            if (err) {
              if (tries >= 3) {
                grr.log.error('Three failed login attempts');
                grr.log.info('Reset the password?');
                return offerReset(username);
              }
              return setupAuth();
            }

            grr.config.save(function (err) {
              return err ? callback(err) : callback();
            });
          });
        });
      });
    })();
  }

  function confirmUserHelper(username, inviteCode, callback) {
    grr.log.info('Confirming user ' + username.magenta);

    var user = {
      username: username,
      inviteCode: inviteCode
    };

    grr.users.confirm(user, function (err, response) {
      if (err) {
        return callback(err);
      }

      if (response.error) {
        grr.log.error(response.error);
        return callback(response.error);
      }

      grr.log.info('Great success! ' + username.magenta + ' is now confirmed.');
      if (!response.hasPassword) {
        (function getNewPass() {

          grr.log.help('Now that the account is confirmed, a password is required');
          grr.log.help('In the future, the password can be reset by running the' + ' grr users forgot'.magenta + ' command');
          grr.log.help('Set the new password below');

          grr.prompt.get(['set password', 'confirm password'], function (err, results) {
            if (err) {
              return callback(err);
            }
            if (results['set password'] !== results['confirm password']) {
              grr.log.error('The provided passwords do not match.');
              return getNewPass();
            }
            grr.users.forgot(username, {
              shake: response.shake,
              'new-password': results['set password']
            }, function (err, res) {
              // Since we have new password information, let's save it.

              grr.config.set('username', username);
              grr.config.set('password', results['set password']);

              grr.config.save(function (err) {
                return err ? callback(err) : callback(null, res);
              });
            });
          });
        })();
      }
      else {
        grr.log.info('User ' + username.magenta + ' confirmed');
        grr.log.info('Log in now?');
        grr.prompt.get(['login'], function (err, result) {
          if (err) {
            return callback(err);
          }
          if (/^n.+/.test(result.login)) {
            return callback();
          }
          grr.log.info('Attempting to log in as '+username.magenta);
          setupUserNoUsername(callback);
        });
      }
    });
  }

  if (!username) {
    return callback(new Error('username is required'), true);
  }
  else if (inviteCode) {
    //
    // They are providing an inviteCode so lets reset the password
    //
    return confirmUserHelper(username, inviteCode, callback);
  }

  grr.prompt.get(['invite code'], function (err, result) {
    confirmUserHelper(username, result['invite code'], callback);
  });
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