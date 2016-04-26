'use strict';
var spawn = require('child_process').spawn;

var paths = require('./paths.js');
var gifs = require('../model/gifs.js');
var finalPath = paths.finalPath;

// Parameters: error, user requesting, gif creator, personal or public, callback
exports.getGallery = function(err, creator, personal, callback) {

  var query = {},
      options = {};

  if(creator) {
    query.creator = creator.username;
  }
  if(!personal) {
    query.public = true;
  }

  // Testing needed for limits, no limit at the moment
  // var options = personal ? {'limit':20} : {} ;

  options.sort = {'date': -1};

  gifs.find(query, null, options, function(err, result) {
    if(err) {
      callback(err);
    }
    else {
      callback(null, result);
    }
  });
}

exports.deleteGif = function(err, gifName, creator, callback) {
  gifs.remove({fileName: gifName, creator: creator.username}, function(err) {
    if(err) {
      callback(err);
    }
    else {
      var cleaner = spawn('find', [ finalPath + '/', '-maxdepth', '1', '-name', gifName, '-type', 'f', '-delete']);
      cleaner.on('error', function(err) { 
        callback(err);
      });
      cleaner.on('close', function() {
        callback(null);
      });
    }
  });
}

exports.likeGif = function(err, gifName, user, like, callback) {
  gifs.findOne({fileName: gifName}, function(err, gif) {
    if(err) {
      callback(err);
    }
    else {
      if(gif) {
        var likesIndex = gif.likes.indexOf(user.username);
        var correct = true;

        if(likesIndex === -1 && like === true) {
          gif.likes.push(user.username);
        }
        else if(likesIndex > -1 && like === false) {
          gif.likes.splice(likesIndex, 1);
        }
        else {
          correct = false;
          callback("Error liking/unliking the gif");
        }
        
        if(correct) {
          gif.save(function(err) {
            if(err) {
              callback(err);
            }
            else {
              callback(null);
            }
          })
        }
      }
      else {
        callback("Invalid gif name");
      }
    }
  });
}