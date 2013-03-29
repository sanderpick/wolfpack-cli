#!/usr/bin/env node

/**
 * Arguments.
 */
var optimist = require('optimist');
var argv = optimist
    .describe('help', 'Get help')
    .describe('dev', 'Environment')
      .boolean('dev')
    .describe('port', 'Port to listen on')
      .default('port', 8889)
    .describe('db', 'MongoDb URL to connect to')
      .default('db', 'mongodb://nodejitsu_sanderpick:2tibce5mvs61d0s4373kknogu7@ds051947.mongolab.com:51947/nodejitsu_sanderpick_nodejitsudb4770110165')
    .argv;

// if (argv.dev)
  argv.db = 'mongodb://localhost:27018/wolfpack';

if (argv._.length || argv.help) {
  optimist.showHelp();
  process.exit(1);
}

/**
 * Module dependencies.
 */
var http = require('http');
var cronJob = require('cron').CronJob;
var mongodb = require('mongodb');
var ObjectID = require('mongodb').BSONPure.ObjectID;
var jade = require('jade');
var util = require('util'), debug = util.debug, inspect = util.inspect;
var _ = require('underscore');
_.mixin(require('underscore.string'));
var Step = require('step');
var templates = require('./templates');
var Email = require('./email');
var notifier = require('mail-notifier');
var PackDb = require('./pack_db.js').PackDb;
var packDb;

// crate a new comment (as above) from an email reply
function broadcastReply(mail) {
  var re = /^notifications\+([a-z0-9]{24})@grr\.io$/i;
  var match;
  _.each(mail.to, function (to) {
    match = to.address.match(re) || match;
  });
  if (match) {
    var last = mail.text.match(/^(.*wrote:\n)/im)[1];
    var body = last ?
              mail.text.substr(0, mail.text.indexOf(last)).trim():
              mail.text;
    packDb.collections.pack.findOne({_id: new ObjectID(match[1])},
          function (err, p) {
      Email.reply(mail.from, p, function () {
        // console.log('Emailed "' + p.name + '".');
      });
    });
  }
}

if (!module.parent) {
  Step(
    function () {
      console.log('Connecting to', argv.db);
      mongodb.connect(argv.db, {server: { poolSize: 4 }}, this);
    },
    function (err, db) {
      if (err) return this(err);
      new PackDb(db, {
        ensureIndexes: true
      }, this);
    },
    function (err, db) {
      if (err) return this(err);
      packDb = db;
      this();
    },
    function (err) {
      if (err) return this(err);

      // open a port (required for nodejitsu)
      http.createServer(function (req, res) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Grr.\n');
      }).listen(argv.port);

      // start the cron jobs
      // new cronJob('1 * * * * *', function () {
      //     packDb.collections.pack.find({}).toArray(function (err, ps) {
      //       _.each(ps, function (p) {
      //         Email.morning(p, function () {
      //           console.log('Emailed "' + p.name + '".');
      //         });
      //       });
      //     });
      //   },
      //   function () {}, true, 'America/Los_Angeles');

      // listen for new mail
      notifier({
        username: 'notifications@grr.io',
        password: 'w0lfpackm0d3',
        host: 'imap.gmail.com',
        port: 993,
        secure: true
      }).on('mail', broadcastReply).start();

    }
  );
}
