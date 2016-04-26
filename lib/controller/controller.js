'use strict';

var downloader = require('./downloader.js');
var editor = require('./editor.js');
var publisher = require('./publisher.js');
var gallery = require('./gallery.js');

exports.createGif = function(req, callback) {
  downloader(req.body, function(err, result) {
    editor.merge(err, result, req.user.username, function(err, result) {
      callback(err, result);
    });
  });
}

exports.publishGif = function(req, callback) {
  if(req.params && req.params.gifName) {
    var body = req.body;
    publisher.publish(null, req.params.gifName, body.publicValue, body.tags, req.user.username, callback);
  }
  else {
    callback("Wrong request parameters");
  }
}

exports.getGallery = function(req, callback) {
  if(req.params && req.params.user) {
    gallery.getGallery(null, {username: req.params.user}, false, callback);
  }
  else {
    gallery.getGallery(null, null, false, callback);
  }
}

exports.getSelfGallery = function(req, callback) {
  gallery.getGallery(null, req.user, true, callback);
}

exports.deleteGif = function(req, callback) {
  if(req.params && req.params.gifName) {
    gallery.deleteGif(null, req.params.gifName, req.user, callback);
  }
  else {
    callback("Wrong request parameters");
  }
}

exports.likeGif = function(req, callback) {
  if(req.params && req.params.gifName) {
    gallery.likeGif(null, req.params.gifName, req.user, true, callback);
  }
  else {
    callback("Wrong request parameters");
  }
}

exports.unlikeGif = function(req, callback) {
  if(req.params && req.params.gifName) {
    gallery.likeGif(null, req.params.gifName, req.user, false, callback);
  }
  else {
    callback("Wrong request parameters");
  }
}