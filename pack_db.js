// Functionality for wolfpacks.

/**
* Module dependencies.
*/
var db = require('./db');
var _ = require('underscore');
_.mixin(require('underscore.string'));
var util = require('util');
var debug = util.debug, inspect = util.inspect;
var Step = require('step');


/*
 * Create a db wrapper.
 */
var MemberDb = exports.MemberDb = function (dB, options, cb) {
  var self = this;
  self.dB = dB;
  self.app = options.app;
  self.collections = {};

  var collections = {
    pack: {index: {email: 1, username: 1}},
  };

  Step(
    function () {
      var group = this.group();
      _.each(collections, function (k, name) {
        dB.collection(name, group());
      });
    },
    function (err, cols) {
      if (err) return this(err);
      _.each(cols, function (col) {
        self.collections[col.collectionName] = col;
      });
      if (options.ensureIndexes) {
        var parallel = this.parallel;
        _.each(cols, function (col) {
          var index = collections[col.collectionName].index;
          if (index)
            col.ensureIndex(index, parallel());
        });
      } else this();
    },
    function (err) {
      cb(err, self);
    }
  );
}


/*
 * Creates a new wolfpack.
 */
MemberDb.prototype.createPack = function (props, cb) {
  var self = this;
  if (!db.validate(props, ['name']))
    return cb(new Error('Invalid pack'));
  _.defaults(props, {
    wolves: []
  });
  db.createDoc(self.collections.pack, props, cb);
}
