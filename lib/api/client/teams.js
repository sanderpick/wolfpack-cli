/*
 * teams.js: Client for the Wolfpack teams API.
 *
 */

var util = require('util');
var Client = require('./client').Client;

/*
 * Constructor function for the Teams resource.
 * @options {Object} Options for this instance.
 */
var Teams = exports.Teams = function (options) {
  Client.call(this, options);
};

// Inherit from Client base object.
util.inherits(Teams, Client);

/*
 * Lists all teams for the authenticated user.
 * @username {string} username of the user to list teams for.
 * @cb {function} Continuation to pass control to when complete.
 */
Teams.prototype.list = function (username, cb) {
  if (arguments.length === 1) {
    cb = username;
    username = this.options.get('username');
  }
  this.request('GET', ['teams', username], cb, function (res, result) {
    cb(null, result || res.statusCode);
  })
};

/*
 * Creates a team.
 * @props {Object} Properties for the new team.
 * @cb {function} Continuation to pass control to when complete.
 */
Teams.prototype.create = function (name, props, cb) {
  this.request('POST', ['teams', name], props, cb, function (res, result) {
    cb(null, result || res.statusCode);
  })
};

/*
 * Views the team specified by `name`.
 * @name {string} Name of the team to view.
 * @cb {function} Continuation to pass control to when complete.
 */
Teams.prototype.view = function (name, cb) {
  this.request('GET', ['teams', name], cb, function (res, result) {
    cb(null, result.app || res.statusCode);
  })
};

/*
 * Updates the team with `name` with the specified `props`.
 * @name {string} Name of the team to update.
 * @props {Object} Properties to update.
 * @cb {function} Continuation to pass control to when complete.
 */
Teams.prototype.update = function (name, props, cb) {
  this.request('PUT', ['teams', name], props, cb, function (res, result) {
    cb(null, result || res.statusCode);
  });
};

/*
 * Destroys the team with `name` for the authenticated user. 
 * @name {string} Name of the team to destroy.
 * @cb {function} Continuation to pass control to when complete.
 */
Teams.prototype.destroy = function (name, cb) {
  this.request('DELETE', ['teams', name], cb, function (res, result) {
    cb(null, result || res.statusCode);
  })
};

/*
 * Checks the availability of the specified `name`.
 * @name {string} Name of the team to check availability against.
 * @cb {function} Continuation to pass control to when complete.
 */
Teams.prototype.available = function (name, cb) {
  this.request('GET', ['teams', name, 'available'], cb,
      function (res, result) {
    cb(null, result || res.statusCode);
  });
};

/*
 * Invites an existing user to an existing team.
 * @name {string} Name of the team for invite.
 * @props {Object} Properties of the invite (inviter, invitee).
 * @cb {function} Continuation to pass control to when complete.
 */
Teams.prototype.invite = function (name, props, cb) {
  this.request('POST', ['teams', name, 'invite'], props, cb, function (res, result) {
    cb(null, result || res.statusCode);
  });
};