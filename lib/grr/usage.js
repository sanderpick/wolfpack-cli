/*
 * usage.js: Text for `grr help`.
 *
 */
 
var colors = require('colors');

module.exports = [
  '   ___  ___  ___'.cyan,
  '  / _  /  / /  /'.cyan,
  ' /__/ /    /'.cyan,

  '',
  'Lightweight team updates.',
  'https://github.com/xxx/wolfpack',
  '',

  'Usage:'.cyan.bold.underline,
  '',
  '  grr <resource> <action> <param1> <param2> ...',
  '',

  'Common Commands:'.cyan.bold.underline,
  '',

  'To sign up for Wolfpack'.cyan,
  '  grr signup',
  '',

  'To log into Wolfpack'.cyan,
  '  grr login',
  '',

  'To create a new team'.cyan,
  '  grr teams create',
  '',

  'Additional Commands'.cyan.bold.underline,
  '  grr teams create',
  '  grr teams invite <username> <teamname>',
  '  grr users list',
];