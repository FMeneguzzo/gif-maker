var globalCounter = 0,  // How many videos have been added to the page
    trueCounter = 0,    // How many videos are currently on the page
    players = [],       // List of the video players on the page
    resultName;         // Name of the temporary gif that is going to be published

// Returns the URL on which the middleware is mounted
var mountUrl = function() {
  var pathArray = location.href.split( '/' ),
      protocol = pathArray[0],
      host = pathArray[2],
      url = protocol + '//' + host;

  // Last cell is 'create'
  for(var i=3; i<pathArray.length-1 ; i++) {
    url += '/' + pathArray[i];
  }

  return url;
}();

function matchYoutubeUrl(url) {
  var pattern = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
  
  if(url.match(pattern)){
      return url.match(pattern)[1];
  }

  return false;
};

function preview(position) {
  // Force to integer fix
  var start = + document.getElementById('start' + position).value,
      end = + document.getElementById('end' + position).value;

  var player = players[position][0];

  if(end>start && start >= 0 && end < player.getDuration()) {
    player.cueVideoById({
      videoId: player.getVideoData().video_id,
      startSeconds: start,
      endSeconds: end,
      suggestedQuality: 'hd720'
    });

    player.playVideo();
  }
  else
    alert("Error starting the preview, check the value of your parameters.");
}

function deleteVideo(position) {
  var father = document.getElementById('videos'),
      child = document.getElementById('video'+position);

  father.removeChild(child);
  players[position] = undefined;
  trueCounter--;
}

// Adds a video player for the selected video in the page
function addVideo(url) {
  globalCounter++;
  trueCounter++;
  counter = globalCounter - 1;

  var verifiedUrl = matchYoutubeUrl(url);
    if(verifiedUrl) {
      // Creates the frames
      var newFrame = document.createElement('div'),
          videoContainer = document.createElement('div'),
          videoFrame = document.createElement('frame'),
          optionsFrame = document.createElement('div');

      newFrame.setAttribute('id', 'video'+counter);     
      newFrame.setAttribute('class', 'row');

      videoContainer.setAttribute('class', 'col-md-6 col-md-offset-1 col-xs-10 col-xs-offset-1 no-margin video-container');

      videoFrame.setAttribute('id', 'video-frame-'+counter);
      videoFrame.onload = function() {
        var player = new YT.Player('video-frame-'+counter, {
          height: '240',
          width: '427',
          videoId: verifiedUrl,
          events: {
            'onReady': function() {
              if(player.getDuration() > 1200) {
                alert("Maximum duration: 20 minutes");
                deleteVideo(counter);
              }
              else if(trueCounter > 3) {
                alert("Maximum videos: 3");
                deleteVideo(counter);
              }
              else {
                var optionsHTML = "";
                optionsHTML += '<p>Video length in seconds, end time must have an equal or lower value: ' + (player.getDuration() - 1) + '</p>';
                optionsHTML += 'Gif start time (in seconds) <input type="number" class="form-control" id="start' + counter + '" step="0.001" min="0" max="'+player.getDuration()+'"/>';
                optionsHTML += 'Gif end time (in seconds) <input type="number" class="form-control" id="end' + counter + '" step="0.001" min="0" max="'+player.getDuration()+'"/>';
                optionsHTML += '<button class="btn btn-primary" onclick="preview(' + counter + ')">Preview!</button>';
                optionsHTML += '<button class="btn btn-danger" onclick="deleteVideo(' + counter + ')">Delete video!</button>';
                optionsFrame.innerHTML = optionsHTML;
              }
            },
            'onStateChange': function(event) {/*console.log(event)*/}
          }
        });
        players.push([player, counter]);
      }
      
      optionsFrame.setAttribute('class', 'col-md-5 col-xs-10 col-xs-offset-1 no-margin');

      // Adds the frames on the DOM
      document.getElementById("videos").appendChild(newFrame);
      newFrame.appendChild(videoContainer);
      newFrame.appendChild(optionsFrame);
      videoContainer.appendChild(videoFrame);  
    }
    else
      alert("The URL you entered is invalid.");       
}

// Formats time from seconds into "hours:minutes:seconds.milliseconds"
var formatTime = function(s) {
  milliseconds = Math.floor((s*1000) % 1000);
  seconds = Math.floor(s % 60);
  s /= 60
  minutes = Math.floor(s % 60);
  s /= 60;
  hours = Math.floor(s % 24);
  return hours + ":" + minutes + ":" +  seconds + "." + milliseconds;
}

// Submits the gif creation to the server
function submit() {
  var req = [];
  var correct = true;

  if(trueCounter > 3 || trueCounter < 1) {
    correct = false;
  }

  for(var i = 0; i<players.length; i++) {
    if(players[i] != undefined) {
      var player = players[i][0],
          position = players[i][1];

      var start = +document.getElementById('start' + position).value,
          end = +document.getElementById('end' + position).value;
      
      var serverStart = formatTime(start),
          serverDuration = formatTime(end-start);
      
      if(end>start && start >= 0 && end < player.getDuration() && player.getDuration() <= 1200 && (end-start) <= 10 ) {
        req.push({
          url: player.getVideoUrl(),
          position: i,
          duration: {
            start: serverStart,
            length: serverDuration
          }
        });
      }
      else
        correct = false;
    }
  }

  if(correct) {
    // Parameters are correct, disables the submit button and scrolls at the bottom
    document.getElementById('result-preview').innerHTML = "<h1> The request has been sent, your result will appear here! </h1>";
    window.scrollTo(0, document.body.scrollHeight || document.documentElement.scrollHeight);

    var submitButton = document.getElementById('submit-btn');
    submitButton.setAttribute('class', 'bottom-btn btn disabled btn-success col-md-4 col-md-offset-4');

    // Submits the request
    $.ajax({
      url: mountUrl + "/create",
      type: 'POST',
      data: JSON.stringify(req),
      contentType: "application/json; charset=utf-8",
      success: function(result){
        var videoName = /\.webm$/;
        if(result.match(videoName)) {
          addGifToPage(result);
        }
       else {
          alert(result);
        }
        // Enables back the submit button
        submitButton.setAttribute('class', 'bottom-btn btn btn-success col-md-4 col-md-offset-4');
      } 
    });
  }
  else
    alert("Error submitting your gif, check the value of your parameters.");
}

// Shows the created gifs on the creation page
var addGifToPage = function(gifName) {

  resultName = gifName;
  var gifUrl = mountUrl + '/gifs/' +  gifName;

  var result_frame = document.getElementById('result-preview');

  var videoFrame = document.createElement('video');
  videoFrame.setAttribute('id', 'gif-preview');
  videoFrame.setAttribute('preload', 'auto');
  videoFrame.setAttribute('autoplay', 'autoplay');
  videoFrame.setAttribute('muted', 'muted');
  videoFrame.setAttribute('loop', 'loop');
  videoFrame.setAttribute('webkit-playsinline', '');
  videoFrame.innerHTML = '<source src=' + gifUrl.trim() + ' type="video/webm">';

  var selectMessage = document.createElement('h2');
  selectMessage.innerHTML = 'Select gif gallery visibility.';

  var radioGroup = document.createElement('div');
  radioGroup.setAttribute('id', 'radio-group');

  var publicRadio = document.createElement('input');
  publicRadio.setAttribute('id', 'public_radio');
  publicRadio.setAttribute('class', 'radio.inline');
  publicRadio.setAttribute('type', 'radio');
  publicRadio.setAttribute('name', 'public');
  publicRadio.setAttribute('value', '1');
  publicRadio.setAttribute('checked', '');

  var publicLabel = document.createElement('label');
  publicLabel.setAttribute('for', 'public_radio');
  publicLabel.innerHTML = 'Public';

  var privateRadio = document.createElement('input');
  privateRadio.setAttribute('id', 'private_radio');
  privateRadio.setAttribute('class', 'radio.inline');
  privateRadio.setAttribute('type', 'radio');
  privateRadio.setAttribute('name', 'private');
  privateRadio.setAttribute('value', '2');

  var privateLabel = document.createElement('label');
  privateLabel.setAttribute('for', 'private_radio');
  privateLabel.innerHTML = 'Private';

  radioGroup.appendChild(publicRadio);
  radioGroup.appendChild(publicLabel);
  radioGroup.appendChild(privateRadio);
  radioGroup.appendChild(privateLabel);

  var publishButton = document.createElement('button');
  publishButton.setAttribute('class', 'bottom-btn btn btn-success');
  publishButton.setAttribute('onclick', 'publish()');
  publishButton.innerHTML = 'Add your gif to your collection!';

  var resultPreview = document.getElementById('result-preview');
  resultPreview.appendChild(videoFrame);
  resultPreview.appendChild(selectMessage);
  resultPreview.appendChild(radioGroup);
  resultPreview.appendChild(publishButton);
  
  var gif = document.getElementById('gif-preview');
  gif.onloadeddata = function() {
    window.scrollTo(0, document.body.scrollHeight || document.documentElement.scrollHeight);
  }
}

// Sends the publish request to the server
var publish = function() {
  var radioValue = document.querySelector('input[name="public"]:checked').value;
  var req = {
    publicValue: radioValue,
    tags: []
  };

  $.ajax({
      url: mountUrl + "/publish/" + resultName,
      type: 'POST',
      data: JSON.stringify(req),
      contentType: "application/json; charset=utf-8",
      success: function(result){
        location.href= mountUrl + '/sgallery';
      },
      error: function(err){
        console.log(err);
      }
    });
}