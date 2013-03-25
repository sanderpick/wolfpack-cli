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
      .default('port', 3645)
    .describe('db', 'MongoDb URL to connect to')
      .default('db', 'mongodb://nodejitsu_sanderpick:2tibce5mvs61d0s4373kknogu7@ds051947.mongolab.com:51947/nodejitsu_sanderpick_nodejitsudb4770110165')
    .argv;

if (argv.dev) {
  argv.db = 'mongodb://localhost:27018/nodejitsu_sanderpick_nodejitsudb4770110165';
}

if (argv._.length || argv.help) {
  optimist.showHelp();
  process.exit(1);
}

/**
 * Module dependencies.
 */
var http = require('http');
var mongodb = require('mongodb');
var ObjectID = require('mongodb').BSONPure.ObjectID;
var util = require('util'), debug = util.debug, inspect = util.inspect;

var _ = require('underscore');
_.mixin(require('underscore.string'));
var Step = require('step');
var Email = require('./email');

var notifier = require('mail-notifier');

var MemberDb = require('./member_db.js').MemberDb;

var memberDb;

// crate a new comment (as above) from an email reply
// function createCommentFromMail(mail) {
//   var re = /^notifications\+([a-z0-9]{24})([a-z0-9]{24})@island\.io$/i;
//   var match;
//   _.each(mail.to, function (to) {
//     match = to.address.match(re) || match;
//   });
//   if (match) {
//     var last = mail.text.match(/^(.*wrote:\n)/im)[1];
//     var body = last ?
//               mail.text.substr(0, mail.text.indexOf(last)).trim():
//               mail.text;
//     var props = {
//       member_id: new ObjectID(match[1]),
//       post_id: new ObjectID(match[2]),
//       body: body,
//       email: true
//     };
//     memberDb.createComment(props, function (err, doc) {
//       if (err) return err;
//       distributeComment(doc, doc.member);
//       distributeUpdate('comment', 'post', 'ccnt', doc.post._id);
//       eventDb.publish({
//         member_id: new ObjectID(doc.member._id),
//         post_id: new ObjectID(doc.post._id),
//         data: {
//           m: doc.member.displayName,
//           a: 'commented on',
//           p: doc.post.title,
//           k: doc.post.key,
//           b: doc.body
//         }
//       });
//     });
//   }
// }

if (!module.parent) {

  Step(
    function () {
      console.log('Connecting to database:', argv.db);
      mongodb.connect(argv.db, {server: { poolSize: 4 }}, this);
    },
    function (err, db) {
      if (err) return this(err);
      new MemberDb(db, {
        ensureIndexes: true
      }, this);
    },
    function (err, mDb) {
      if (err) return this(err);
      memberDb = mDb;
      this();
    },
    function (err) {
      if (err) return this(err);

      // open a port (required for nodejitsu)
      http.createServer(function (req, res) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Grr.\n');
      }).listen(argv.port, '127.0.0.1');
      console.log('Server running at http://127.0.0.1:' + argv.port + '/');

      // listen for new mail
      notifier({
        username: 'notifications@island.io',
        password: 'I514nDr06ot',
        host: 'imap.gmail.com',
        port: 993,
        secure: true
      }).on('mail', function() {
        console.log('got mail.');
      }).start();

    }
  );
}
