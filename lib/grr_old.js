#!/usr/bin/env node

/**
 * Arguments.
 */
var optimist = require('optimist');
var argv = optimist
    .describe('help', 'Get help')
    .describe('dev', 'Environment')
      .boolean('dev')
    .describe('db', 'MongoDb URL to connect to')
      .default('db', 'mongodb://nodejitsu_sanderpick:2tibce5mvs61d0s4373kknogu7'
          + '@ds051947.mongolab.com:51947/nodejitsu_sanderpick_nodejitsudb4770110165')
    .argv;

if (!argv._.length || argv.help) {
  optimist.showHelp();
  process.exit(1);
}

// if (argv.dev)
  argv.db = 'mongodb://localhost:27018/wolfpack';

/**
 * Module dependencies.
 */
var _ = require('underscore');
_.mixin(require('underscore.string'));
var Step = require('step');

// Exits with err message.
function exit(err) {
  console.log(err);
  process.exit(1);
}

// Opens a connection to database.
var open = exports.open = function (cb) {
  var mongodb = require('mongodb');
  var PackDb = require('../pack_db.js').PackDb;
  mongodb.connect(argv.db, {server: {poolSize: 4}}, function (err, db) {
    if (err) return cb(err);
    new PackDb(db, {ensureIndexes: true}, cb);
  });
}

// Handles 'pack' sub-command.
var pack = exports.pack = function () {
  open(function (err, db) {

    var name = process.argv.length > 3 ? _.last(process.argv) : null;

    if (!name)
      return db.collections.pack.find({}, {sort: {created: 1}})
                         .toArray(function (err, ps) {
        console.log(ps);
        process.exit(0);
      });
    else
      db.createPack({name: name}, function (err, p) {
        console.log('Created new pack "' + p.name + '".');
        process.exit(0);
      });

  });
}

// Handles 'add' sub-command.
var add = exports.add = function () {
  open(function (err, db) {
    if (!argv.pack) exit('Missing option --pack');
    var email = _.last(argv._);
    db.addEmail(email, argv.pack, function (err) {
      console.log('Adding', email, 'to', argv.pack);
      process.exit(0);
    });

  });
}

// parse command
var parsed;
_.each(exports, function (v, k) {
  if (!parsed && _.find(argv._, function (i) {
      return i === k; })) { parsed = true; v(); }
});
