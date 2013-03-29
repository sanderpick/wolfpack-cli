/*
 * alias.js: Aliases commands for grr.
 *
 */
 
var grr = require('../grr');

//
// Alias the appropriate commands for simplier CLI usage
//
grr.alias('forgot',  { resource: 'users',  command: 'forgot' });
grr.alias('list', { resource: 'teams',   command: 'list' });
grr.alias('ls', { resource: 'teams',   command: 'list' });
