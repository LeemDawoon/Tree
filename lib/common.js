/**
 * File Name : common.js
 * Description : tree에서 공통적으로 사용되는 함수와 미들웨어를 관리합니다.
 **/
var logger = require('../config/logger');
var formidable = require('formidable');
var path = require('path');
var async = require('async');
var fstools = require('fs-tools');
// var easyimage = require('easyimage');

var s3 = require('s3');
var s3Config = require('../config/s3');

var serverHost = require('../config/server').serverHost;


/* 로그인 되있는지 확인하는 미들웨어 */
function isLoggedIn(req, res, next) {
  
  if (req.isAuthenticated()) {
    logger.debug("req.isAuthenticated() ====> true");
    return next();
  }
  
  logger.debug("req.isAuthenticated() ====> false");
  // return next({ message : "not logged in" });
  return res.redirect('/loginForm');
}

function isLoggedInHome(req, res, next) {
  
  if (req.isAuthenticated()) {
    logger.debug("req.isAuthenticated() ====> true");
    return next();
  }
  
  logger.debug("req.isAuthenticated() ====> false");
  // return next({ message : "not logged in" });
  return res.render('homeLoggedOut');
}


/* 상태메시지를 보내는 함수 */
function sendSuccessMessage(res, message) {
  res.json({
    "success" :1,
    "result"  : {
      "message":message,
    }
  });
}




module.exports.processS3UploadFiles = function processS3UploadFiles(req, callback) {


  var form = new formidable.IncomingForm();
  form.uploadDir = path.join(__dirname , "/../uploads/");
  form.keepExtensions = true;
  form.multiples = true;
  
  var result = {
      uploadFiles : [],
      formFields : {}
  };
  
  form.on('field', function(name, value) {
    if (!result.formFields[name]) {
      result.formFields[name] = value;
    } else {
      if (result.formFields[name] instanceof Array) { // 배열일 경우
        result.formFields[name].push(value);
      } else { // 배열이 아닐 경우
        var tmp = result.formFields[name];
        result.formFields[name] = [];
        result.formFields[name].push(tmp);
        result.formFields[name].push(value);
      }
    }
  });
  
  form.parse(req, function(err, fields, files) {
    
    var client = s3.createClient({
      s3Options : {
        accessKeyId : s3Config.key,
        secretAccessKey : s3Config.secret,
        region : s3Config.region,
      }
    });
    
    if (files.pict instanceof Array) {
      async.each(files.pict,
        function(file, cb) {
          var originFileName = file.name;
          var realFilePath = file.path;
          var realFileName = path.basename(file.path);
          var params = {
              localFile : realFilePath,
              s3Params : {
                Bucket : s3Config.bucket,
                Key : req.imageDir +"/"+realFileName, // bucket 안에 들어가는 path 정보, 같은 path는 있을 수 없다.
                ACL : s3Config.imageACL //읽기만 가능
              }
          };
          
          var uploader = client.uploadFile(params);
          uploader.on('error', function (err) {
            logger.error(err);
            cb(err);
          });
          uploader.on('end', function() {
            var s3URL = s3.getPublicUrl(params.s3Params.Bucket, params.s3Params.Key, s3Config.region);
            result.uploadFiles.push({
              "originalFileName" : originFileName,
              "realFilename" : realFileName,
              "s3URL" : s3URL,
            });
            fstools.remove(realFilePath, function(err) {
              if (err) {
                logger.error(err);
                cb(err);
              } else {
                cb(null, result);
              }
            });
          });
        },
        function(err) {
          if (err) {
            callback(err);
          } else {
            callback(null, result);
          }
        }
      );
    } else if(!files.pict) { //서버로 파일 전송시 변수명을 pict로 줘야함. 딴거로 주고 싶음. 옆에 소스랑 여기저기 pict로 된거  고쳐야함.
      logger.debug("fields: ", fields);
      callback(null, result);
    } else {
      var originFileName = files.pict.name;
      var realFilePath = files.pict.path;
      var realFileName = path.basename(files.pict.path);
      
      var params = {
          localFile : realFilePath,
          s3Params : {
            Bucket : s3Config.bucket,
            Key : req.imageDir +"/"+realFileName, // bucket 안에 들어가는 path 정보, 같은 path는 있을 수 없다.
            ACL : s3Config.imageACL //읽기만 가능
          }
      };
      
      var uploader = client.uploadFile(params);
      
      uploader.on('error', function (err) {
        logger.error(err);
      });
      
      uploader.on('end', function() {
        var s3URL = s3.getPublicUrl(params.s3Params.Bucket, params.s3Params.Key, s3Config.region);
        
        /*async.series([
          function makeThumb(callbackf) {
            easyimage.rescrop({
              src: realFilePath,
              dst: realFilePath,
              width:100, height:100,
              cropwidth:80, cropheight:80,
              x:0, y:0,
              gravity: Center
            }).then(
              function(image)) {
                logger.debug("프로필사진 썸네일 만들기 성공===>", image.width, 'x', image.height);
                callbackf(null);
              },
              function(err) {
                logger.error("프로필사진 썸네일 만들기 에러===>", err);
                callbackf(err);
              }
            );    
          }, 
          function saveThumb(callbackf) {
            params.s3Params.Key =  req.imageThumbDir +"/"+realFileName;
            var 
          } 
          ],);*/
        

        result.uploadFiles.push({
          "originalFileName" : originFileName,
          "realFilename" : realFileName,
          "s3URL" : s3URL, //s3에 저장된 url??
        });



        fstools.remove(realFilePath, function(err) {
          if (err) {
            logger.error(err);
            callback(err, null);
          } else {
            callback(null, result); 

          }
        });


      });// end of uploader's end-event 
    }
  });
};

module.exports.processS3DeleteFile = function processS3DeleteFile(req, callback) {
  var client = s3.createClient({
    s3Options : {
      accessKeyId : s3Config.key,
      secretAccessKey : s3Config.secret,
      region : s3Config.region,
    }
  });
  
  var s3Params = {
    Bucket : s3Config.bucket,
    Delete : {
      Objects : [
        {Key: req.imageDir + "/" + req.params.file} //req.param('file')}
      ]
    }
  };
  
  client.deleteObjects(s3Params).on('error', function(err) {
    logger.error(err);
    callback(err);
  }).on('end', function() {
    callback();
  });
};


module.exports.isLoggedIn = isLoggedIn;
module.exports.isLoggedInHome = isLoggedInHome;
module.exports.sendSuccessMessage = sendSuccessMessage;
  


 
  
