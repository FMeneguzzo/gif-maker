var fs = require('fs'),
    youtubedl = require('youtube-dl'),
    async = require('async');

var paths = require('./paths.js');

module.exports = function(url, callback){
  var orderedFiles = [];

  var check = function() {console.log("checked")};

  var downloadPath = paths.tmpPath;

  async.each(url, function(item, check) {
    var video = youtubedl(item.url,['--format=43']);

    // Unique name 
    var name = 1 + item.position + "x" + new Date().getTime() + ".webm";
    // duration: {start:, length:}
    orderedFiles[item.position] = { name: name, duration: item.duration };

    video.pipe(fs.createWriteStream(downloadPath + '/' + name));

    video.on('info', function(info) {
      console.log('Download started');
      console.log('filename: ' + info._filename);
      console.log('size: ' + info.size);
    });

    video.on('error', function(err) {
      callback(err);
    })
    
    video.on('end', function() {
      console.log(name+" download finished.");
      check();
    });

  }, function() {
    console.log("Finished all downloads");
    orderedFiles = orderedFiles.filter(function(item) {return item != undefined});
    callback(null, orderedFiles);
  });
}
