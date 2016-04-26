var path = require('path');

exports.tmpPath = path.resolve(__dirname, '../../tmp');
exports.finalPath = path.resolve(__dirname, '../../public/gifs');

exports.FF_FFMPEG_PATH = path.resolve(__dirname, '../../dependencies/ffmpeg/ffmpeg');
exports.FF_FFPROBE_PATH = path.resolve(__dirname, '../../dependencies/ffmpeg/ffprobe');
