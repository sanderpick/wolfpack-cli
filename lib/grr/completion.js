/**
 * completion.js: Bash completion for grr
 */

var fs = require('fs');

var complete = require('complete'),
    output = complete.output;

/**
 * Grr Commands
 */

// grr teams [<command>]
//   grr teams create
//   grr teams list
//   grr teams add
//   grr teams view    [<name>]
//   grr teams update  [<name>]
//   grr teams destroy [<name>]

// grr users [<commands>]
//   grr users confirm <username> <invitecode>

// grr help [<commands>]
//   grr help teams
//   grr help users

// grr signup
// grr login
// grr logout
// grr conf

/**
 * Dynamic Completion
 */

var echo = {
  teams: function(words, prev, cur) {
    var teams = cache.read('teams');
    if (teams) {
      output(cur, teams);
      return;
    }

    var username = grr().config.get('username');

    grr().teams.list(username, function(err, teams) {
      if (err || !teams || !teams.length) {
        cache.write('teams', []);
        return;
      }

      teams = teams.map(function(team) {
        return team.name;
      });

      output(cur, teams);
      cache.write('teams', teams);
    });
  }
};

/**
 * Dynamic Completion Switch
 */

if (!process.env.GRR_COMPLETION) {
  echo = { teams: {} };
}

/**
 * Caching
 */

var cache = {
  file: '/tmp/.grr-completion',
  time: 2 * 60 * 1000,
  read: function(name) {
    var mtime, data;

    try {
      mtime = +fs.statSync(cache.file).mtime;
    } catch (e) {
      return;
    }

    if (mtime < new Date - cache.time) {
      return fs.unlinkSync(cache.file);
    }

    try {
      data = JSON.parse(fs.readFileSync(cache.file, 'utf8'));
      return name ? data[name] : data;
    } catch (e) {
      return;
    }
  },
  write: function(name, data) {
    var data = data || {},
        stale = cache.read() || {};

    stale[name] = data;

    try {
      stale = JSON.stringify(stale);
      fs.writeFileSync(cache.file, stale);
    } catch (e) {
      ;
    }
  }
};

/**
 * Lazy Loading
 */

function grr() {
  if (!grr.module) {
    grr.module = require('../../');
    grr.module.setup(function() {});
  }

  return grr.module;
}

/**
 * Commands
 */

var commands = {
  'teams': {
    'create': {},
    'list': {},
    'add': {},
    'view': echo.teams,
    'update': echo.teams,
    'destroy': echo.teams
  },

  'users': {
    'confirm': function(words, prev, cur) {
      var username = grr().config.get('username') || '';
      output(cur, [username]);
    }
  },

  'whoami': {},

  'help': {
    'teams': {},
    'users': {}
  },

  'signup': {},
  'login': {},
  'logout': {},
  'conf': {}
};

var options = {
  '--version': {},
  '-v': {},
  '--localconf': {},
  '--grrconf': {},
  '-j': {},
  '--colors': {},
  '-r': {},
  '--raw': {},
  '-c': {},
  '--confirm': {},
  '-d': {},
  '--dev': {}
};

/**
 * Aliases
 */

// commands.short = commands.long;

/**
 * Execute
 */

complete({
  program: 'grr',
  commands: commands,
  options: options
});
