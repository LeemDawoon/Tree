var express = require('express');
var router = express.Router();

/*모듈 로딩*/
var passport = require('passport');
var request = require('request');
var async = require('async');
var path = require('path');


// var treePath = require('../config/tree_path');
// var serverHost = require('../config/server').serverHost;

// var processS3UploadFiles = require('../lib/common').processS3UploadFiles;
// var processS3DeleteFile  = require('../lib/common').processS3DeleteFile;


/* GET home page. */
var home = function(req, res, next) {

  /*res.render('homeLoggedIn',{
    my_t_thumbnail:req.user.t_thumbnail,
    my_t_id:req.user.t_id
  });*/
  if (!req.isAuthenticated()) {
     global.logger.debug("logged out ========================>homeLoggedOut");
    res.render('homeLoggedOut') ;
  } else {
    global.logger.debug("logged in ========================>homeLoggedIn");
//    res.redirect('/profile/'+req.user.u_id);
    res.render('homeLoggedIn',{
      my_u_name: req.user.u_name,
      my_u_thumbnail:req.user.u_thumbnail,
      my_u_id:req.user.u_id
    });
  }
 
};


/* Login */
function authenticateLocalLogin(req, res, next) {
  passport.authenticate('local-login', function(err, user, info) {// passport 미들웨어 형식(err, user, info)
    if (err) {
      return next(err);
    }
    if (!user) {
      logger.debug("not logged in... ");
      // return next({ message : info });
      return res.redirect('/loginForm');
    }
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      logger.debug("logged in... ");
      next();
    });
  })(req, res, next);
}

/* Sign in*/
function authenticateLocalSignup(req, res, next) {
  passport.authenticate('local-signup', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      logger.debug("not signed up... ");
      // return next({ message : info });
      return res.redirect('/loginForm');
    }
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      logger.debug("signed up... ");
      next();
    });
  })(req, res, next);
}

/* facebook login */
function authenticateFacebookLogin(req, res, next) {
  passport.authenticate('facebook-token', function(err, user, info) {// passport 미들웨어 형식(err, user, info)
    if (err) {
      return next(err);
    }
    if (!user) {
      global.logger.debug("not logged in... ");
      // return next({ message : info });
      return res.redirect('/loginForm');
    }
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      global.logger.debug("logged in... ");
      next();
    });
    
  })(req, res, next);
}

/* GET login Form page*/
var loginForm = function(req, res, next) {
	res.render('loginForm')	;
};


/* logout */
var logout = function(req, res, next) {
  if(req.user.u_fb_id){
    request(//logout은 facebook의 토큰을 없애는
      {
        url: "https://graph.facebook.com/v2.1/me/permissions?access_token=" + req.user.u_fb_token,
        method: 'DELETE'
      },
      function(err, response, body) {
        if (err) {
          global.logger("[logout] ==>",err);
          err.message = "로그아웃 중 오류가 발생하였습니다.";
          next(err);
        } else {
          global.logger.debug("response.statusCode: ", response.statusCode);
          global.logger.debug("body: ", body);
          req.logout(); // 세션정보(우리쪽의) 삭제 
          res.redirect('/');
        }
      }
    );
  }else{
    req.logout(); // 세션정보(우리쪽의) 삭제 
    res.redirect('/');
  }
};


router.get('/',  home);

/* GET login Form page*/
router.get('/loginForm',loginForm);


/* sign in with local */
router.route('/sginIn').post(authenticateLocalLogin, home);

/* sign up with local */
router.route('/signUp').post(authenticateLocalSignup, home);


/* sign in with facebook */ 
// router.route('/auth/facebook').get(authenticateFacebookLogin, home);
router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/auth/facebook/callback', passport.authenticate('facebook', { //facebook 에서 보내온 요청
  successRedirect: '/',
  failureRedirect: '/loginForm'
}));

/* log out */
router.get('/logout', logout);

module.exports = router;
