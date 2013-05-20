/*
 * users.js: Client for the Wolfpack users API.
 *
 */
 
var util = require('util');
var Client = require('./client').Client;

/*
 * Constructor function for the Users resource.
 * @options {Object} Options for this instance.
 */
var Users = exports.Users = function (options) {
  Client.call(this, options);
};

// Inherit from Client base object.
util.inherits(Users, Client);

/*
 * Tests the authentication of the user identified in this process.
 * @cb {function} Continuation to pass control to when complete.
 */
Users.prototype.auth = function (cb) {
  this.request('GET', ['auth'], cb, function (res, body) {
    cb(null, true);
  });
};

/*
 * Creates a new user with the properties specified by `user`.
 * @props {Object} Properties for the new user.
 * @cb {function} Continuation to pass control to when complete.
 */
Users.prototype.create = function (props, cb) {
  this.request('POST', ['users', props.username], props, cb,
      function (res, result) {
    cb();
  });
};

/*
 * Checks the availability of the specified `username`.
 * @username {string} Username to check availability for.
 * @cb {function} Continuation to pass control to when complete.
 */
Users.prototype.available = function (username, cb) {
  this.request('GET', ['users', username, 'available'], cb,
      function (res, result) {
    cb(null, result);
  });
};

/*
 * Retrieves data for the specified user.
 * @username {string} Username of user to view.
 * @cb {function} Continuation to pass control to when complete.
 */
Users.prototype.view = function (username, cb) {
  this.request('GET', ['users', username], cb,
      function (res, result) {
    cb(null, result);
  });
};

/*
 * Retrieves all users.
 * @cb {function} Continuation to pass control to when complete.
 */
Users.prototype.list = function (cb) {
  this.request('GET', ['users'], cb, function (res, result) {
    cb(null, result);
  });
};

/*
 * Confirms the specified `user` with `props`.
 * @props {Object} Properties for the user to confirm.
 * @cb {function} Continuation to pass control to when complete.
 */
Users.prototype.confirm = function (props, cb) {
  this.request('POST', ['users', props.username, 'confirm'],
      props, cb, function (res, result) {
    cb(null, result);
  });
};

/*
 * Request an password reset email.
 * @username {String} username requesting password reset.
 * @props {Object} Object containing shake and new password, if applicable.
 * @cb {function} Continuation to pass control to when complete.
 */
Users.prototype.forgot = function (username, props, cb) {
  if (!cb && typeof props === 'function') {
    cb = props;
    props = {};
  }

  this.request('POST', ['users', username, 'forgot'],
      props, cb, function (res, result) {
    return cb(null, result);
  });
};

/*
 * Update user account information.
 * @username {String} username requesting update.
 * @props {Object} Updated information about user.
 * @cb {function} Continuation to pass control to when complete.
 */
Users.prototype.update = function (username, props, cb) {
  this.request('PUT', ['users', username],
      props, cb, function (res, result) {
    cb(null, result);
  });
};

/*
 * Delete user account. Use with extreme caution. So sad to see you go.
 * @username {String} User to delete.
 * @cb {function} Continuation to pass control to when complete.
 */
Users.prototype.destroy = function (username, cb) {
  this.request('DELETE', ['users', username],
      cb, function (res, result) {
    cb(null, result);
  });
};