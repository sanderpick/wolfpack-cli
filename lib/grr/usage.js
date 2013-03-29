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
  'Fucking imagine and crush shit, together.',
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

  // 'To install a pre-built application'.cyan,
  // '  jitsu install',
  // '',

  // 'Deploys current path to Nodejitsu'.cyan,
  // '  jitsu deploy',
  // '',

  'Lists all teams for the current user'.cyan,
  '  grr list',
  '',

  'Additional Commands'.cyan.bold.underline,
  '  grr foo',
  '  grr bar'
];