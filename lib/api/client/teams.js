/*
 * teams.js: Client for the Wolfpack teams API.
 *
 */

var util = require('util'),
    Client = require('./client').Client;

//
// ### function Teams (options)
// #### @options {Object} Options for this instance
// Constructor function for the Teams resource responsible
// with Nodejitsu's Teams API
//
var Teams = exports.Teams = function (options) {
  Client.call(this, options);
};

// Inherit from Client base object
util.inherits(Teams, Client);

//
// ### function list (username, callback)
// #### @callback {function} Continuation to pass control to when complete
// Lists all applications for the authenticated user
//
Teams.prototype.list = function (username, callback) {
  if (arguments.length === 1) {
    callback = username;
    username = this.options.get('username');
  }
  this.request('GET', ['teams', username], callback, function (res, result) {
    callback(null, result || res.statusCode);
  })
};

//
// ### function create (app, callback)
// #### @app {Object} Package.json manifest for the application.
// #### @callback {function} Continuation to pass control to when complete
// Creates an application with the specified package.json manifest in `app`. 
//
Teams.prototype.create = function (name, props, callback) {
  this.request('POST', ['teams', name], props, callback, function (res, result) {
    callback(null, result || res.statusCode);
  })
};

//
// ### function view (appName, callback)
// #### @appName {string} Name of the application to view
// #### @callback {function} Continuation to pass control to when complete
// Views the application specified by `name`.
//
Teams.prototype.view = function (name, callback) {
  this.request('GET', ['teams', name], callback, function (res, result) {
    callback(null, result.app || res.statusCode);
  })
};

//
// ### function update (name, attrs, callback)
// #### @appName {string} Name of the application to update
// #### @attrs {Object} Attributes to update for this application.
// #### @callback {function} Continuation to pass control to when complete
// Updates the application with `name` with the specified attributes in `attrs`
//
Teams.prototype.update = function (name, props, callback) {
  this.request('PUT', ['teams', name], props, callback, function (res, result) {
    callback(null, result || res.statusCode);
  });
};

//
// ### function destroy (appName, callback)
// #### @appName {string} Name of the application to destroy
// #### @callback {function} Continuation to pass control to when complete
// Destroys the application with `name` for the authenticated user. 
//
Teams.prototype.destroy = function (name, callback) {
  this.request('DELETE', ['teams', name], callback, function (res, result) {
    callback(null, result || res.statusCode);
  })
};

//
// ### function available (app, callback)
// #### @app {Object} Application to check availability against.
// #### @callback {function} Continuation to respond to when complete.
// Checks the availability of the `app.name` / `app.subdomain` combo 
// in the current Nodejitsu environment.
//
Teams.prototype.available = function (name, callback) {
  this.request('GET', ['teams', name, 'available'], callback,
      function (res, result) {
    callback(null, result || res.statusCode);
  });
};

//
// ### function update (name, attrs, callback)
// #### @appName {string} Name of the application to update
// #### @attrs {Object} Attributes to update for this application.
// #### @callback {function} Continuation to pass control to when complete
// Updates the application with `name` with the specified attributes in `attrs`
//
Teams.prototype.invite = function (name, props, callback) {
  this.request('POST', ['teams', name, 'invite'], props, callback, function (res, result) {
    callback(null, result || res.statusCode);
  });
};