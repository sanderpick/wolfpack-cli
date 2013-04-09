/*
 * properties.js: Properties for the prompts in grr.
 *
 */

module.exports = {
  invite: {
    name: 'invite code',
    message: 'Invite Code',
    validator: /^\w+$/,
    warning: 'Invite code can only be letters, and numbers'
  },
  proceed: {
    name: 'proceed',
    message: 'Proceed anyway?',
    default: 'no',
    validator: /^y[es]*|n[o]?$/
  },
  yesno: {
    name: 'yesno',
    message: 'are you sure?',
    validator: /y[es]*|n[o]?/,
    warning: 'Must respond yes or no',
    default: 'no'
  }
};
