/*
 * users.js: Client for the Wolfpack users API.
 *
 */
 
var util = require('util'),
    Client = require('./client').Client;
    
//
// ### function Users (options)
// #### @options {Object} Options for this instance
// Constructor function for the Users resource responsible
// with Nodejitsu's Users API
//
var Users = exports.Users = function (options) {
  Client.call(this, options);
};

// Inherit from Client base object
util.inherits(Users, Client);

//
// ### function auth (callback)
// #### @callback {function} Continuation to pass control to when complete
// Tests the authentication of the user identified in this process.
//
Users.prototype.auth = function (callback) {
  this.request('GET', ['auth'], callback, function (res, body) {
    callback(null, true);
  });
};

//
// ### function create (user, callback) 
// #### @user {Object} Properties for the new user.
// #### @callback {function} Continuation to pass control to when complete
// Creates a new user with the properties specified by `user`.
//
Users.prototype.create = function (user, callback) {
  this.request('POST', ['users', user.username], user, callback,
      function (res, result) {
    callback();
  });
};

//
// ### function available (username, callback) 
// #### @username {string} Username to check availability for.
// #### @callback {function} Continuation to pass control to when complete
// Checks the availability of the specified `username`.
//
Users.prototype.available = function (username, callback) {
  this.request('GET', ['users', username, 'available'], callback,
      function (res, result) {
    callback(null, result);
  });
};

//
// ### function view (username, callback)
// #### @callback {function} Continuation to pass control to when complete.
// Retrieves data for the specified user.
//
Users.prototype.view = function (username, callback) {
  this.request('GET', ['users', username], callback,
      function (res, result) {
    callback(null, result);
  });
};

//
// ### function view (username, callback)
// #### @callback {function} Continuation to pass control to when complete.
// Retrieves data for the specified user.
//
Users.prototype.list = function (callback) {
  this.request('GET', ['users'], callback,
      function (res, result) {
    callback(null, result);
  });
};

//
// ### function confirm (user, callback)
// #### @user {Object} Properties for the user to confirm.
// #### @callback {function} Continuation to pass control to when complete
// Confirms the specified `user` by sending the invite code in the `user` specified.
//
Users.prototype.confirm = function (props, callback) {
  this.request('POST', ['users', props.username, 'confirm'],
      props, callback, function (res, result) {
    callback(null, result);
  });
};

//
// ### function forgot (username, callback) 
// #### @username {Object} username requesting password reset.
// #### @params {Object} Object containing shake and new password, if applicable.
// #### @callback {function} Continuation to pass control to when complete
// Request an password reset email.
//
Users.prototype.forgot = function (username, params, callback) {
  if (!callback && typeof params == 'function') {
    callback = params;
    params = {};
  }

  this.request('POST', ['users', username, 'forgot'], params, callback, function (res, result) {
    return callback(null, result);
  });
};

//
// ### function update (username, object, callback)
// #### @username {Object} username requesting password reset.
// #### @object {Object} Updated information about user
// #### @callback {function} Continuation to pass control to when complete
// Update user account information.
//
Users.prototype.update = function (username, object, callback) {
  this.request('PUT', ['users', username], object, callback, function (res, result) {
    callback(null, result);
  });
};

//
// ### function destroy (username, callback)
// #### @username {String} User to delete
// #### @callback {function} Continuation to pass control to when complete
// Delete user account. Use with extreme caution.
//
// So sad to see you go.
//
Users.prototype.destroy = function (username, callback) {
  this.request('DELETE', ['users', username], callback, function (res, result) {
    callback(null, result);
  });
};
