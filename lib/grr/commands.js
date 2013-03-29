/*
 * commands.js: Configuration for commands provided by flatiron plugins.
 *
 */
 
var grr = require('../grr');

grr.use(require('flatiron-cli-users'), {
  before: {
    login: function (details) {
      if (!details || !details.username) {
        grr.log.warn('Login is required to continue');
        grr.log.info('To login, an activated Wolfpack account is required');
        grr.log.help('To create a new account use the ' + 'grr signup'.magenta + ' command');
      }
    }
  },
  after: {
    create: function (details) {
      grr.log.help('Please check for an email sent to ' + details.email.grey + ' for further activation instructions.');
    }
  }
});
