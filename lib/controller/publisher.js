'use strict';
var spawn = require('child_process').spawn;

var paths = require('./paths.js');

var gifs = require('../model/gifs.js'),
    tempGifs = require('../model/tempGifs.js');

var tmpPath = paths.tmpPath,
    finalPath = paths.finalPath;

exports.publish = function(err, gifName, publicValue, tags, creatorName, callback) {
  if(err) {
    callback(err);
  }
  else {
    tempGifs.findOne({fileName: gifName, creator: creatorName}, function(err, result) {
      if(err) {
        callback(err);
      }
      if(result) {
        var mover = spawn('mv', [ tmpPath + '/' + gifName, finalPath + '/' + gifName ]);
        mover.on('close', function() {
          var gif = new gifs({
            fileName: gifName,
            public: publicValue == 1 ? true : false,
            creator: creatorName,
            tags: tags,
            likes: [],
            date: result.date
          });
          gif.save(function(err) {
            if(err) {
              // Future feature: automatic cleanup in case of failure
              callback(err);
            }
            else {
              callback(null, "Gif published successfully!");
            }
          });
          // Not important, done asynchronously 
          tempGifs.remove({creator:creatorName}, function(err) {
            if(err) {
              console.log(err);
            }
          }); 
        });    
      }
      else {
        callback("Temporary gif not found, refresh the page and try again.");
      }
    });
  }
} 
