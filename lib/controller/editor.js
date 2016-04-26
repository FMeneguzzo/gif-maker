'use strict';
var ffmpeg = require('fluent-ffmpeg'),
    async = require('async'),
    fs = require('fs'),
    spawn = require('child_process').spawn;

var paths = require('./paths.js');

var tempGifs = require('../model/tempGifs.js');

var dirPath = paths.tmpPath,
    FF_FFPROBE_PATH = paths.FF_FFPROBE_PATH,
    FF_FFMPEG_PATH = paths. FF_FFMPEG_PATH;

ffmpeg.setFfprobePath(FF_FFPROBE_PATH);
ffmpeg.setFfmpegPath(FF_FFMPEG_PATH);

exports.merge = function(err, videos, creator, callback) {

  if(err) {
    callback(err);
  }
  else {

    var time = new Date().getTime();

    var mergedName = "video" + time + ".webm";

    var shellArgs = [],
        concatFilter = "";

    async.each(videos, function(video, check) {
      var index = videos.indexOf(video),
          item = video.name,
          duration = video.duration;

      var resize = ffmpeg(dirPath + '/' + item );
      resize.size('480x360');
      resize.autopad('black');
      resize.seekInput(duration.start);
      resize.duration(duration.length);
      resize.on('start', function() {console.log("Resizing started: " + item)});
      resize.on('end', function() {
        console.log("Resizing finished: " + item );

        shellArgs.push("-i",dirPath + '/temp' + item);
        concatFilter += "[" + index + ":v:0]\ ";

        check();
      });
      resize.save(dirPath+'/temp'+item);
    }, function() {

      concatFilter += "concat=n=" + videos.length + ":v=1\ [v]";
      shellArgs.push("-filter_complex", concatFilter, "-map", '[v]', dirPath + "/gifs/" + mergedName);

      var child = spawn( FF_FFMPEG_PATH, shellArgs);

      child.on('close', function() {
        console.log("Merge finished");

        var tempGif = new tempGifs({
          fileName: mergedName,
          creator: creator,
          date: time
        });
        tempGif.save(function(err) {
          if(err) {
            callback(err);
          }
          else {
            callback(null, mergedName);
          }
        });

        // Not important, done asynchronously
        for(var i = 0; i<videos.length; i++) {
          var cleaner = spawn('find', [ dirPath+'/', '-maxdepth', '1', '-name', '*'+videos[i].name, '-type', 'f', '-delete']);
          cleaner.on('close', function() { console.log("Cleanup finished.")});
        }
      });
    });
  }
}
