/**
 * New node file
 */
var express = require('express');
var router = express.Router();

/*모듈 로딩*/
var async = require('async');
var path = require('path');


var treePath = require('../config/tree_path');
var serverHost = require('../config/server').serverHost;

var processS3UploadFiles = require('../lib/common').processS3UploadFiles;
var processS3DeleteFile  = require('../lib/common').processS3DeleteFile;


var makeSmallGroup = function(req, res, next) {
  var g_id = req.query.g_id;
  if (req.headers['content-type'] === 'application/x-www-form-urlencoded') { 
  } else {
    
    req.imageDir = treePath.uploadPath.smallgroup;
    processS3UploadFiles(req, function(err, result) {
      var sg_depth = parseInt(result.formFields.sg_depth)+1;
      var sg_id = result.formFields.sg_id;
      var sg_name=result.formFields.sg_name;
      var sg_intro = result.formFields.sg_intro 
//      var my_u_id = req.user.u_id;
      process.nextTick(function() {
        global.connectionPool.getConnection(function(err, connection) {
          if (err) {
            connection.release();
            err.message = "Small Group 생성 중 오류가 발생하였습니다.";
            global.logger.error("[makeSmallGroup] - connectionPool==>",err);
            return next(err);
          }
          var insertSmallGroupSQL="INSERT INTO small_group(g_id, sg_name, sg_intro, sg_thumbnail, sg_parent_sg_id, sg_depth) VALUES(?,?,?,?,?,?) ";
          connection.query(insertSmallGroupSQL, [ g_id, sg_name, sg_intro, result.uploadFiles[0].s3URL, sg_id, sg_depth  ], function(err,info) {
            if (err) {
              connection.release();
              global.logger.error("[makeSmallGroup] - insertSmallGroupSQL ==>",err);
              err.message = "Small Group 생성 중 오류가 발생하였습니다.";
              return next(err);
            } else {
              return res.redirect('/group/'+g_id+"/manage");
            } // end of if-else
          });//end of query - insertSmallGroupSQL
        });//end of connectionPool  
      });// end of process.nextTick
    });// end of processS3UploadFiles
  }
};


var updateSmallGroup = function (req, res, next) {
  var sg_id = req.params.sg_id;
  var g_id = req.query.g_id;
  if (req.headers['content-type'] === 'application/x-www-form-urlencoded') { //upload profile data
    var sg_parent_sg_id = req.body.sg_parent_sg_id;
    var sg_depth = parseInt(req.body.sg_depth)+1;
    global.logger.debug("----------------updateSmallGroup-----------------:",sg_parent_sg_id);
    process.nextTick(function() {
      global.connectionPool.getConnection(function(err, connection) {
        if (err) {
          connection.release();
          err.message = "Small Group 부모 소그룹 설정 변경 중 오류가 발생하였습니다.";
          global.logger.error("[updateSmallGroup] - connectionPool==>",err);
          return next(err);
        }
        var updateSmallGroupSql = "UPDATE small_group set sg_parent_sg_id=?, sg_depth=? WHERE sg_id=? ";
        
        connection.query(updateSmallGroupSql, [ sg_parent_sg_id, sg_depth, sg_id ], function(err,info) {
          if (err) {
            connection.release();
            global.logger.error("[updateSmallGroup] - insertSmallGroupSQL ==>",err);
            err.message = "Small Group 부모 소그룹 설정 변경 중 오류가 발생하였습니다.";
            return next(err);
          } else {
            return res.redirect('/group/'+g_id+"/manage");
          } // end of if-else
        });//end of query - insertSmallGroupSQL
      });//end of connectionPool  
    });// end of process.nextTick
  } else { //upload profile photo
    req.imageDir = treePath.uploadPath.smallgroup;
    var oldPhotoPath;
    var newPhotoPath;
    var sg_name;
    var sg_intro; 
    async.series([
      function getOldSmallGroupPhotoPath(callback) {
        process.nextTick(function() {
          global.connectionPool.getConnection(function(err, connection) {
            if (err) {
              global.logger.error("[updateSmallGroup] - getConnection ==>",err);
              return callback(err);
            }
            /* Table : user (사용자 테이블)
             * Column : u_id (사용자 식별자)
             * SQL 설명 : 사용자의 프로필 사진 정보를 가져옵니다. 이는 사진 path 정보를 저장한 후, 추후에 삭제하기 위함입니다.*/
            var getOldSmallGroupPhotoPathSql=  "SELECT sg_thumbnail From small_group WHERE sg_id=? ";
            connection.query(getOldSmallGroupPhotoPathSql, [ sg_id ], function(err, rows, fields){
              connection.release();
              if (err) {
                global.logger.error("[updateSmallGroup] ß- getOldGroupPhotoPathSql ==>",err);
                callback(err);
              } else {
                if (rows[0].sg_thumbnail) {
                  oldPhotoPath = rows[0].sg_thumbnail;
                }
                 global.logger.debug("updateSmallGroup photo getOldGroupPhotoPath");
                callback(null);
              }//end of if-else
            });// end of connection
          });// end of connection pool
        });//end of nextTick
      }, 
      function uploadSmallGroupPhoto(callback){
        processS3UploadFiles(req, function(err, result) {
          sg_name = result.formFields.sg_name;
          sg_intro = result.formFields.sg_intro;
          if (err) {
            global.logger.error("[updateSmallGroup] - uploadGroupPhoto ==>",err);
            callback(err);
          } else {
            newPhotoPath = result.uploadFiles[0].s3URL;
            global.logger.debug("updateSmallGroup photo uploadGroupPhoto");
            callback(null);
          }
        });
      },
      function updateSmallGroupPhotoPath(callback) {
        process.nextTick(function() {
          global.connectionPool.getConnection(function(err, connection) {
            if (err) {
              global.logger.error("[updateSmallGroup] - profile photo - getConnection ==>",err);
              return callback(err);
            }
            
            /* Table : user (사용자 정보 테이블)
             * Column :  u_thumbnail (사용자 프로필 사진), u_id (사용자 식별자)
             * SQL 설명 : 사용자의 프로필 사진경로를 저장합니다.*/
            var updateSmallGroupPhotoPathSql = "update small_group set sg_thumbnail=? where sg_id=? ";
            connection.query(updateSmallGroupPhotoPathSql, [ newPhotoPath, sg_id ], function(err, result) {
              connection.release();
              if (err) {
                global.logger.error("[updateSmallGroup] - updateSmallGroupPhotoPathSql ==>",err);
                return callback(err);
              }
              global.logger.debug("updateSmallGroup photo updateSmallGroupPhotoPath");
              callback(null);
            });// end of connection
          });// end of connection pool
        });// end of process.nextTick
      },
      function deleteOldGroupPhoto(callback) {
        req.params.file = path.basename(oldPhotoPath);
        processS3DeleteFile(req,function(err) {
          if (err) {
            global.logger.error("[updateSmallGroup] - deleteOldGroupPhoto ==>",err);
            return callback(err);
          } else {
            global.logger.debug("updateSmallGroup photo deleteOldProfilePhoto");
            callback(null);
          }
        });
      },
      function updateSmallGroupInfo(callback) {
        process.nextTick(function() {
          global.connectionPool.getConnection(function(err, connection) {
            if (err) {
              global.logger.error("[updateSmallGroup] - profile photo - getConnection ==>",err);
              return callback(err);
            }
            
            /* Table : user (사용자 정보 테이블)
             * Column :  u_thumbnail (사용자 프로필 사진), u_id (사용자 식별자)
             * SQL 설명 : 사용자의 프로필 사진경로를 저장합니다.*/
            var updateSmallGroupInfoSql = "update small_group set sg_name=?, sg_intro=? where sg_id=? ";
            connection.query(updateSmallGroupInfoSql, [ sg_name, sg_intro, sg_id ], function(err, result) {
              connection.release();
              if (err) {
                global.logger.error("[updateSmallGroup] - updateSmallGroupInfoSql ==>",err);
                return callback(err);
              }
              global.logger.debug("updateSmallGroup updateGroupInfo");
              callback(null);
            });// end of connection
          });// end of connection pool
        });// end of process.nextTick
      }],
      function(err, result) {
        if (err) {
          err.message = "그룹 정보 변경중 오류가 발생하였습니다.";
          return next(err);
        } 
        res.redirect("/group/"+g_id+"/manage");
      }
    );// end of asyc
  }// end of if
};

/* 소그룹 생성하기. */
router.route('/').post(makeSmallGroup);

/* 소그룹 수정하기. */
router.route('/:sg_id').post(updateSmallGroup);





module.exports = router;


