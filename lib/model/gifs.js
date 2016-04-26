'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var gifs = new Schema({
    // Name of the file in the FileSystem, needs a future fallback if master-slave is implemented
    fileName: {type: String, unique: true }, 
    public: Boolean,  // Public gifs are shown in the gallery
    creator: String,  // Gif creator account name
    tags: [String],   // List of descriptive tags
    likes: [String],  // List of users who liked the gif
    date: String      // Date of creation
});

module.exports = mongoose.model('gifs', gifs);