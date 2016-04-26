'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tempGifs = new Schema({
    // Name of the file in the FileSystem, needs a future fallback if master-slave is implemented
    fileName: {type: String, unique: true },
    creator: String,  // Gif creator account name
    date: String      // Date of creation
});

module.exports = mongoose.model('tempGifs', tempGifs);