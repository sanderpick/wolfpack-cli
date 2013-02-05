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
      .default('db', 'mongodb://nodejitsu_sanderpick:as3nonkk9502pe1ugseg3mj9ev@ds043947.mongolab.com:43947/nodejitsu_sanderpick_nodejitsudb9750563292')
    .argv;

if (argv.dev) {
  argv.db = 'mongodb://localhost:27018/nodejitsu_sanderpick_nodejitsudb9750563292';
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

var jade = require('jade');
var templates = require('./templates');

var _ = require('underscore');
_.mixin(require('underscore.string'));
var Step = require('step');

var notifier = require('mail-notifier');

var MemberDb = require('./member_db.js').MemberDb;
var EventDb = require('./event_db.js').EventDb;
var Pusher = require('pusher');

var memberDb;
var eventDb;
var pusher;
var channels = process.env.NODE_ENV === 'production' ?
                { all: 'island' } :
                { all: 'island_test' };

var templateUtil = {
  formatCommentText: function (str) {
    var linkExp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    str = str.replace(/\n/g, '<br/>');
    str = str.replace(linkExp,"<a href='$1' target='_blank'>$1</a>");
    return str;
  },

  isValidDate: function (d) {
    if (Object.prototype.toString.call(d) !== '[object Date]')
      return false;
    return !isNaN(d.getTime());
  },
};


// crate a new comment (as above) from an email reply
function createCommentFromMail(mail) {
  var re = /^notifications\+([a-z0-9]{24})([a-z0-9]{24})@island\.io$/i;
  var match;
  _.each(mail.to, function (to) {
    match = to.address.match(re) || match;
  });
  if (match) {
    var last = mail.text.match(/^(.*wrote:\n)/im)[1];
    var body = last ?
              mail.text.substr(0, mail.text.indexOf(last)).trim():
              mail.text;
    var props = {
      member_id: new ObjectID(match[1]),
      post_id: new ObjectID(match[2]),
      body: body,
      email: true
    };
    memberDb.createComment(props, function (err, doc) {
      if (err) return err;
      distributeComment(doc, doc.member);
      distributeUpdate('comment', 'post', 'ccnt', doc.post._id);
      eventDb.publish({
        member_id: new ObjectID(doc.member._id),
        post_id: new ObjectID(doc.post._id),
        data: {
          m: doc.member.displayName,
          a: 'commented on',
          p: doc.post.title,
          k: doc.post.key,
          b: doc.body
        }
      });
    });
  }
}

// comment json to html
function renderComment(params, cb) {
  cb(null, templates.comment(_.extend(params, { util: templateUtil })));
}

// add new comment to everyone's page
function distributeComment(comment, member) {
  var params = {
    comment: comment,
    showMember: true
  };
  renderComment(params, function (err, html) {
    if (err) return console.log(inspect(err));
    pusher.trigger(channels.all, 'comment.read', {
      html: html,
      id: comment.post._id,
      mid: member._id
    });
  });
};

// tell everyone about some meta change
function distributeUpdate(type, target, counter, id) {
  if ('string' === typeof id)
    id = new ObjectID(id);
  var query = {};
  var proj = {};
  query['_id'] = id;
  proj[counter] = 1;
  Step(
    function () {
      var next = this;
      memberDb.collections[target].findOne(query, proj,
                                          function (err, doc) {
        if (err) return fail(err);
        next(null, doc[counter]);
      });
    },
    function (err, count) {
      if (err) return fail(err);
      if ('media' === target)
        return pusher.trigger(channels.all, 'update.read', {
          ids: [id.toString()],
          type: type,
          count: count
        });
      memberDb.collections.media.find({ post_id: id })
              .toArray(function (err, docs) {
        if (err) return fail(err);
        var ids = _.map(docs, function (doc) {
                        return doc._id.toString(); });
        pusher.trigger(channels.all, 'update.read', {
          ids: ids,
          type: type,
          count: count
        });
      });
    }
  );
  function fail(err) {
    console.log(inspect(err));
  }
};

if (!module.parent) {

  Step(
    function () {
      console.log('Connecting to database:', argv.db);
      mongodb.connect(argv.db, {server: { poolSize: 4 }}, this);
    },
    function (err, db) {
      if (err) return this(err);
      pusher = new Pusher({
        appId: '35474',
        key: 'c260ad31dfbb57bddd94',
        secret: 'b29cec4949ef7c0d14cd'
      });
      new MemberDb(db, {
        app: app,
        ensureIndexes: true,
        redisClient: redisClient
      }, this.parallel());
      new EventDb(db, {
        app: app,
        ensureIndexes: true,
        pusher: pusher,
      }, this.parallel());
    },
    function (err, mDb, eDb) {
      if (err) return this(err);
      memberDb = mDb;
      eventDb = eDb;
      eventDb.memberDb = memberDb;
      this();
    },
    function (err) {
      if (err) return this(err);

      // listen for new mail
      notifier({
        username: 'notifications@island.io',
        password: 'I514nDr06ot',
        host: 'imap.gmail.com',
        port: 993,
        secure: true
      }).on('mail', createCommentFromMail).start();

    }
  );
}
