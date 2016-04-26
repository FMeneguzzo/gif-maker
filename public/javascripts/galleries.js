var mountUrl = function() {
  var pathArray = location.href.split( '/' ),
      protocol = pathArray[0]
      host = pathArray[2]
      url = protocol + '//' + host,
      appRoutes = 1; // Last index cell is ''

  // App routes after the mount url
  if(pathArray.lastIndexOf('sgallery') > 2) {
    appRoutes = 1;
  }
  else if(pathArray.lastIndexOf('user_gallery') > 2) {
    appRoutes = 2;
  }

  for(var i=3; i<(pathArray.length-appRoutes); i++) {
    url += '/' + pathArray[i];
  }

  return url;
}();

// Requests the gallery information to the server
var showGallery = function(personal, user, creator) {
  var isPersonal = personal ? true : false;

  var action = isPersonal ? '/self_gallery' : '/gallery';
  var reqUrl = mountUrl + action;

  if(creator !== null) {
    reqUrl += '/' + creator;
  }
  $.ajax({
    url: reqUrl,
    success: function(gifs){
      renderGallery(isPersonal, user, gifs);
    },
    error: function(err){
      console.log(err);
    }
  });
}

// Shows the gallery gifs in the page
var renderGallery = function(isPersonal, user, gifs) {
  var gallery = document.getElementById('gallery-videos');

  if(gifs.length === 0) {
    gallery.innerHTML += '<h2>There are no gifs at the moment :(</h2>';
  }

  // Creates a frame for each video and pushes it into the DOM
  for(var i=0; i<gifs.length; i++) {
    var gifName = gifs[i].fileName,
        gifUrl = mountUrl + '/gifs/' + gifName;

    var gif = document.createElement('div');
    gif.setAttribute('class', 'video-item col-lg.3 col-md-4 col-sm-6 col-xs-12');

    var videoFrame = document.createElement('video');
    videoFrame.setAttribute('preload', 'auto');
    videoFrame.setAttribute('autoplay', 'autoplay');
    videoFrame.setAttribute('muted', 'muted');
    videoFrame.setAttribute('loop', 'loop');
    videoFrame.setAttribute('webkit-playsinline', '');
    videoFrame.innerHTML = '<source src=' + gifUrl.trim() + ' type="video/webm">';

    var buttonsGroup = document.createElement('div');
    buttonsGroup.setAttribute('class', 'btn-group btn-group-justified');

    var likesButton = '<button id="likesButton_' + gifName + '" class="btn btn-default disabled" type="button")>+'+ gifs[i].likes.length +'</button>',
        deleteButton = '<button class="btn btn-danger" onclick="deleteGif(\''+gifName+'\')">Delete gif</button>',
        likeButton = '<button id="likeButton_' + gifName + '" class="btn btn-success" onclick="likeGif(true, \''+gifName+'\')">Like gif!</button>',
        unlikeButton = '<button id="unlikeButton_' + gifName + '"class="btn btn-warning" onclick="likeGif(false,\''+gifName+'\')">Unlike gif!</button>',
        shareButton = '<button class="btn btn-primary" onclick="share(\''+gifName+'\')")>Share!</button>';
    
    var wrapButtonFix = function(button) {
      return '<div class="btn-group">' + button + '</div>';
    }

    var likesButton = wrapButtonFix(likesButton),
        deleteButton = wrapButtonFix(deleteButton),
        likeButton = wrapButtonFix(likeButton),
        unlikeButton = wrapButtonFix(unlikeButton),
        shareButton = wrapButtonFix(shareButton);

    var date = new Date(parseInt(gifs[i].date));
    var dateToStr = date.toUTCString().split(' ');
    var printableDate = dateToStr[2] + ' ' 
                      + dateToStr[1] + ', ' 
                      + dateToStr[3] + ' at '
                      + dateToStr[4] ;

    var description = document.createElement('P');
    var descriptionHTML = '';

    if(isPersonal) {
      buttonsGroup.innerHTML += likesButton;
      buttonsGroup.innerHTML += gifs[i].likes.indexOf(user) > -1 ? unlikeButton : likeButton ;
      buttonsGroup.innerHTML += shareButton + deleteButton;

      descriptionHTML += 'Created on ' + printableDate + ' - ' 
                      + (gifs[i].public ? 'public' : 'private');
    }
    else {
      var buttonsGroupHTML = likesButton;
      if(user) {
        buttonsGroupHTML += gifs[i].likes.indexOf(user) > -1 ? unlikeButton : likeButton ;
      }

      buttonsGroupHTML += shareButton;
      buttonsGroup.innerHTML = buttonsGroupHTML;

      descriptionHTML += 'Created by <a href="' + mountUrl 
                      + '/user_gallery/' + gifs[i].creator
                      + '">' +  gifs[i].creator + '</a>'
                      + ' on ' + printableDate;
    }

    description.innerHTML = descriptionHTML;

    gallery.appendChild(gif);

    gif.appendChild(description);
    gif.appendChild(videoFrame);
    gif.appendChild(buttonsGroup);
  }
}

// Sends the delete request to the server
var deleteGif = function(gifName) {
  var reqUrl = mountUrl + '/delete/' + gifName;
  var deleteConfirmation = confirm("You are about to delete your gif! Continue?");
  $.ajax({
    url: reqUrl,
    type: 'POST',
    success: function(result){
      location.reload(true);
    },
    error: function(err){
      console.log(err);
    } 
  });
}

// Reverses the like/unlike buttons when liking or unliking a gif
var flipButtons = function(like, gifName) {
  var likesButton = document.getElementById('likesButton_' + gifName)
      likeType = like ? '' : 'un',
      likeButtonType = likeType + 'likeButton_',
      likedButton = document.getElementById(likeButtonType + gifName);

  var likes = likesButton.innerHTML.split('+')[1];
  like ? likes ++ : likes-- ;
  likesButton.innerHTML = '+' + likes;

  var newLikeType = like ? 'un' : '',
      newLikeButtonType = newLikeType + 'likeButton_',
      newId = newLikeButtonType + gifName ,
      newClass = 'btn btn-' + (like ? 'warning' : 'success'),
      newOnclick = 'likeGif(' + !like + ', \'' + gifName + '\')',
      newInnerHTML = like ? 'Unlike Gif!' : 'Like gif!';

  likedButton.setAttribute('id', newId);
  likedButton.setAttribute('class', newClass);
  likedButton.setAttribute('onclick', newOnclick);
  likedButton.innerHTML = newInnerHTML;
}

// Sends the like/unlike request to the server
var likeGif = function(like, gifName) {
  var action = like ? '/like/' : '/unlike/';
  var reqUrl = mountUrl + action + gifName;
  $.ajax({
    url: reqUrl,
    type: 'POST',
    success: function(result){
      flipButtons(like, gifName);
    },
    error: function(err){
      console.log(err);
    } 
  });
}

var share = function(gifName) {
  var win = window.open(mountUrl + '/share/' + gifName , '_blank');
  win.focus();
}