// Handling for, wait for it ... email!

/**
 * Module dependencies.
 */
var mailer = require('emailjs');
var path = require('path');
var jade = require('jade');
var _ = require('underscore');
_.mixin(require('underscore.string'));
var Step = require('step');

var SMTP;
var server = {
  user: 'robot@grr.io',
  password: 'w0lfpackm0d3',
  host: 'smtp.gmail.com',
  ssl: true,
};
var defaults = {
  from: 'Wolfpack <robot@grr.io>',
};

/**
 * Send an email.
 * @param object options
 * @param object template
 * @param function cb
 */
var send = exports.send = function (options, template, cb) {
  if ('function' === typeof template) {
    cb = template;
    template = false;
  }

  // connect to server
  if (!SMTP)
    SMTP = mailer.server.connect(server);

  // merge options
  _.defaults(options, defaults);
  
  if (template)
    jade.renderFile(path.join(__dirname, 'views', template.file),
        template.locals || {}, function (err, body) {
      if (err) return cb ? cb(): null;
      
      // create the message
      var message;
      if (template.html) {
        message = mailer.message.create(options);
        message.attach_alternative(body);
      } else message = options;
      message.text = body;
      
      // send email
      SMTP.send(message, cb);
    });
  else
    // send email
    SMTP.send(options, cb);
};

/**
 * Send the morning email.
 * @param object pack
 */
var morning = exports.morning = function (pack, cb) {
  if (pack.emails.length === 0) return cb();
  var _cb = _.after(pack.emails.length, cb);
  _.each(pack.emails, function (to) {
    send({
      to: to,
      from: 'Wolfpack <robot@grr.io>',
      'reply-to': 'notifications+' + pack._id.toString() + '@grr.io',
      subject: '[Wolfpack] Good Morning',
    }, {
      file: 'morning.jade',
      html: true,
    }, _cb);
  });
}

/**
 * Send a reply.
 * @param object user
 */
var reply = exports.reply = function (from, pack, cb) {
  if (pack.emails.length === 0) return cb();
  var _cb = _.after(pack.emails.length, cb);
  _.each(pack.emails, function (to) {
    send({
      to: to,
      from: 'ass' + ' <robot@grr.io>',
      'reply-to': 'notifications+' + pack._id.toString() + '@grr.io',
      subject: 'asfvadfsvadfvfdv'
    }, {
      file: 'reply.jade',
      html: true,
      // locals: {
      //   note: note,
      //   link: HOME_URI + '/' + note.event.data.k,
      //   sets_link: HOME_URI + '/settings/' + member.key
      // }
    }, _cb);
  });
}
