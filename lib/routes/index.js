'use strict';

var express = require('express'),
    passport = require('passport');

var account = require('../model/account');

var controller = require('../controller/controller');

var router = express.Router();

var mountURL;

var titleGenerator = function(page) {
  return page + " | Gif-maker"
}

// Gets the mount URL for template rendering
var getMountUrl = function(req, current) {
  if(mountURL === undefined) {
    var originalUrl = req.originalUrl.split('/').filter(function(n) { return n !== ''; });
    var mountIndex = originalUrl.lastIndexOf(current);

    if(current !== '') {
      originalUrl.splice(mountIndex)
    }

    var result = '';
    for(var i=0; i<originalUrl.length; i++) {
      result += '/' + originalUrl[i]
    }

    mountURL = result;
  }
  return mountURL;
}

// Public rendering routes

router.get('/', function (req, res) {
  res.render('index', { user : req.user, title: titleGenerator("Home"), mountUrl: getMountUrl(req, '') });
});

router.get('/register', function(req, res) {
  res.render('register', { title: titleGenerator("Register"), mountUrl: getMountUrl(req, 'register') });
});

router.post('/register', function(req, res) {
  account.register(new account({ username : req.body.username }), req.body.password, function(err, account) {
      if (err) {
          return res.render('register', { account : account, title: titleGenerator("Register"), mountUrl: getMountUrl(req, 'register') });
      }

      passport.authenticate('local')(req, res, function () {
          res.redirect(mountURL + '/');
      });
  });
});

router.get('/login', function(req, res) {
  res.render('login', { user : req.user, title: titleGenerator("Login"), mountUrl: getMountUrl(req, 'login') });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
  res.redirect(mountURL + '/');
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect(mountURL + '/');
});

router.get('/create', function(req, res) {
  res.render('create', { user: req.user, title: titleGenerator("Create a gif"), mountUrl: getMountUrl(req, 'create') });
});

router.get('/sgallery', function(req, res) {
  res.render('sgallery', { user: req.user, title: titleGenerator("Personal gallery"), mountUrl: getMountUrl(req, 'sgallery') });
});

router.get('/share/:gifName', function(req, res) { 
  res.render('share', {gifName: req.params.gifName, mountUrl: getMountUrl(req, 'share')});
});

// Gallery API

router.get('/gallery', function(req, res) {
  controller.getGallery(req, function(err, result) {
    if(err) {
      res.status(500).send({error: err});
    }
    else {
      res.send(result);
    }
  })
});

router.get('/gallery/:user', function(req, res) {
  controller.getGallery(req, function(err, result) {
    if(err) {
      res.status(500).send({error: err});
    }
    else {
      res.send(result);
    }
  })
});

router.get('/user_gallery/:user', function(req, res, next) {
  if(req.params && req.user && req.params.user === req.user.username) {
    res.redirect(mountURL + '/sgallery');
  }
  else {
    res.render('gallery', {user: req.user, creator: req.params.user, mountUrl: getMountUrl(req, 'user_gallery')});
  }
});

// Authenticated routes

var manageAuthenticatedReq = function(req, res, reqFunction) {
  if(req.isAuthenticated()) {
    reqFunction(req, function(err, result) {
      if(err) {
        res.status(500).send({error: err});
      }
      else {
        res.send(result);
      }
    }); 
  }
  else {
    res.redirect('/');
  }  
}
  
router.post('/create', function(req, res) {
  manageAuthenticatedReq(req, res, controller.createGif);
});

router.post('/publish/:gifName', function(req, res) {
  manageAuthenticatedReq(req, res, controller.publishGif);
});

router.get('/self_gallery', function(req, res) { 
  manageAuthenticatedReq(req, res, controller.getSelfGallery);
});

router.post('/delete/:gifName', function(req, res) { 
  manageAuthenticatedReq(req, res, controller.deleteGif);
});

router.post('/like/:gifName', function(req, res) {
  manageAuthenticatedReq(req, res, controller.likeGif);
});

router.post('/unlike/:gifName', function(req, res) { 
  manageAuthenticatedReq(req, res, controller.unlikeGif);
});

// Error handlers
// Catches 404 and forward to error handler
router.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

router.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
      title: titleGenerator("Error"),
      message: err.message,
      error: err,
      mountUrl: mountURL
  });
});



module.exports = router;
