var express = require('express');
var router = express.Router();

/*모듈 로딩*/
var async = require('async');
var path = require('path');


var treePath = require('../config/tree_path');
var serverHost = require('../config/server').serverHost;

var processS3UploadFiles = require('../lib/common').processS3UploadFiles;
var processS3DeleteFile  = require('../lib/common').processS3DeleteFile;

/* GET profile page */
var getProfile = function(req, res, next) {
	var u_id = req.params.u_id;
	
	process.nextTick(function() {
		global.connectionPool.getConnection(function(err, connection){
			if (err) {
		        global.logger.error("[getProfile] - connectionPool ==>",err);
		        err.message = "프로필 정보 요청 중 오류가 발생하였습니다.";
		    	return next(err);
		    }
		    async.waterfall([
				function getTreeData (callback) {
					/* Table : user(사용자 정보 테이블)
				     * Column :  u_email (이메일)
				     * SQL 설명 : 프로필 편칩을 위해 로그인한 사용자의 프로필 정보를 요청*/
				    var getTreeDataSql = "SELECT u_id, u_email, u_name, u_hp, u_birth, u_thumbnail, u_fb_id From Tree.user WHERE u_id=?";
				    connection.query(getTreeDataSql, [u_id], function(err, rows, fields){
				    	if (err) {
				    		global.logger.error("[getProfile] - getTreeDataSql ==>",err);
	        				err.message = "프로필 정보 요청 중 오류가 발생하였습니다.";
	        				return callback(err);
				    	}
				    	if(!rows.length){
				    		err={};
			    	  	err.message = "프로필 정보 요청 중 오류가 발생하였습니다."+JSON.stringify(rows);
          			return callback(err);
				    	}
				    	var result={};
				    	result.u_id = rows[0].u_id;
				    	result.u_thumbnail = rows[0].u_thumbnail;
				    	result.u_name = rows[0].u_name;
				    	result.u_email = rows[0].u_email;
				    	callback(null,result);
				    });
				},
				function getForestsData(result,  callback) {
					/* Table : user(사용자 정보 테이블), smallgroup(소그룹 정보 테이블), group(숲 정보 테이블)
					 * Column :  u_email (이메일)
					 * SQL 설명 : 프로필 정보 주인의 가입된 Forest 정보를 가져온다.*/
					var getForestsDataSql = 
					  "SELECT g.g_id, g.g_name, g.g_intro, g.g_thumbnail, "+ 
					  "( SELECT count(mm.m_id) "+
					  "FROM member mm JOIN ggroup gg ON (mm.g_id = gg.g_id) "+ 
					  "WHERE gg.g_id=g.g_id AND mm.m_isapproved=1 "+
					  ") g_count "+
					  "FROM  member m JOIN ggroup g ON (m.g_id = g.g_id) "+ 
					  "WHERE m.u_id= ? AND m.m_isapproved=1 "+
					  "ORDER BY g_name ";
					
				    connection.query(getForestsDataSql, [u_id], function(err, rows, fields){
				    	if (err) {
				    		global.logger.error("[getProfile] - getForestsDataSql ==>",err);
	        				return callback(err);
				    	} 
				    	result.group_list = rows;
				    	callback(null,result);
				    });
				},
				function getJoiningGroupData(result,  callback) {
          /* Table : user(사용자 정보 테이블), smallgroup(소그룹 정보 테이블), group(숲 정보 테이블)
           * Column :  u_email (이메일)
           * SQL 설명 : 가입 요청 중인 Group 정보를 가져온다.*/
          var getJoiningGroupDataSQL = 
          
          "SELECT g_name, g_intro, g_thumbnail, " +
          "( SELECT count(mm.m_id) " +
          "FROM member mm JOIN ggroup gg ON (mm.g_id = gg.g_id) " +
          "WHERE gg.g_id=g.g_id AND mm.m_isapproved=1 " +
          ") g_count " +
          "FROM member m JOIN ggroup g ON (m.g_id = g.g_id) " +
          "WHERE m.u_id=? AND m.m_isapproved=0 " +
          "ORDER BY g_name";
          
            connection.query(getJoiningGroupDataSQL, [u_id], function(err, rows, fields){
              if (err) {
                global.logger.error("[getProfile] - getJoiningGroupDataSQL ==>",err);
                  return callback(err);
              } 
              
              result.joining_group_list = rows;
              callback(null,result);
            });
        }],
				function (err, result) {
					connection.release();
      		if (err) {
      		  err.message = "프로필 정보 요청 중 오류가 발생하였습니다.";
      			return next(err);
      		}
      	
      		
          res.render('profile',{
            my_u_id:req.user.u_id,
            my_u_name: req.user.u_name,
            my_u_thumbnail:req.user.u_thumbnail,
            u_id:u_id,
            u_thumbnail : result.u_thumbnail,
            u_name : result.u_name,
            u_email : result.u_email,
            group_list : JSON.stringify(result.group_list),
            joining_group_list : JSON.stringify(result.joining_group_list)
          });
      		
				}
			); //end of async
		}); // end of connection pool
	}); // end of process.nextTick
};

/* GET profile Edit Form page */
var getProfileEidtForm = function(req, res, next) {
	var u_id = req.user.u_id;

	global.logger.debug('getProfileEidtForm=============================>');	
  process.nextTick(function() {
    global.connectionPool.getConnection(function(err, connection){
      
      if (err) {
        global.logger.error("[getProfileEditForm] - connectionPool ==>",err);
        err.message = "프로필 정보 요청 중 오류가 발생하였습니다.";
        return next(err);
      }

      /* Table : user(사용자 정보 테이블)
       * Column :  u_email (이메일)
       * SQL 설명 : 프로필 편칩을 위해 로그인한 사용자의 프로필 정보를 요청*/
      var getProfileSql = "SELECT u_email, u_name, u_hp, u_birth, u_thumbnail, u_fb_id From Tree.user WHERE u_id=?";
      connection.query(getProfileSql, [u_id], function(err, rows, fields){
        connection.release();
        if (err) {
          global.logger.error("[getProfileEditForm] - getProfileSql ==>", err);
          err.message = "프로필 정보 요청 중 오류가 발생하였습니다.";
          return next(err);
        } else {
          res.render('profileEditForm', {
            my_u_id : req.user.u_id,
            my_u_name : req.user.u_name,
            my_u_thumbnail : req.user.u_thumbnail,
            u_email : rows[0].u_email,
            u_name : rows[0].u_name,
            u_hp : rows[0].u_hp,
            u_birth : rows[0].u_birth,
            u_fb_id :'http://www.facebook.com/'+rows[0].u_fb_id, 
            u_thumbnail : rows[0].u_thumbnail
          });
        }
      });// end of query

    });
  });// end of nextTick

  // res.render('profileForm');
};

/* update profile */
var updateProfile = function(req, res, next) {
  if (req.headers['content-type'] === 'application/x-www-form-urlencoded') { //upload profile data
    var u_id =req.user.u_id; 
    var u_name = req.body.u_name;
    var u_hp = req.body.u_hp;
    var u_birth = req.body.u_birth;
    global.logger.debug("update profile---- name : "+u_name);
    global.logger.debug("update profile---- hp : "+u_hp);
    global.logger.debug("update profile---- birth : "+u_birth);
     

    process.nextTick(function() {
      global.connectionPool.getConnection(function(err, connection) {
        if (err) {
          global.logger.error("[updateProfile] - getConnection ==>",err);
          err.message = "프로필 데이터 변경 중  오류가 발생하였습니다.";
          return callback(err);
        }
        /* Table : user (사용자 테이블)
         * Column : u_id (사용자 식별자)
         * SQL 설명 : 사용자의 프로필 사진 정보를 가져옵니다. 이는 사진 path 정보를 저장한 후, 추후에 삭제하기 위함입니다.*/
        
        var updateProfileSql=  "UPDATE user SET u_name =?, u_hp=?, u_birth=? WHERE u_id=? ";
        connection.query(updateProfileSql, [ u_name, u_hp, u_birth, u_id ], function(err, rows, fields){
          connection.release();
          if (err) {
            global.logger.error("[updateProfile] - updateProfileSql ==>",err);
            err.message = "프로필 데이터 변경 중  오류가 발생하였습니다.";
            return next(err);
          } else {
            res.redirect('/profile/'+req.user.u_id);
          }//end of if-else
        });// end of connection
      });// end of connection pool
    });//end of nextTick
    
    
  } else { //upload profile photo
    req.imageDir = treePath.uploadPath.profile;
    req.imageThumbDir = treePath.uploadPath.profile_thumb;
    var oldPhotoPath;
    var newPhotoPath;
    
    async.series([
      function getOldProfilePhotoPath(callback) {
        process.nextTick(function() {
          global.connectionPool.getConnection(function(err, connection) {
            if (err) {
              global.logger.error("[updateProfile] - profile photo - getConnection ==>",err);
              err.message = "프로필 사진 변경중 오류가 발생하였습니다.";
              return callback(err);
            }
            /* Table : user (사용자 테이블)
             * Column : u_id (사용자 식별자)
             * SQL 설명 : 사용자의 프로필 사진 정보를 가져옵니다. 이는 사진 path 정보를 저장한 후, 추후에 삭제하기 위함입니다.*/
            var getOldProfilePhotoPathsSql=  "SELECT u_thumbnail From Tree.user WHERE u_id=? ";
            connection.query(getOldProfilePhotoPathsSql, [ req.user.u_id ], function(err, rows, fields){
              connection.release();
              if (err) {
                global.logger.error("[updateProfile] - profile photo - getOldProfilePhotoPathsSql ==>",err);
                err.message = "프로필 사진 변경중 오류가 발생하였습니다.";
                callback(err);
              } else {
                if (rows[0].u_thumbnail) {
                  if (req.user.u_fb_id) {
                    // photoPaths.push(path.join(__dirname, pixxPath.uploadPath.profile, path.basename(rows[0].picture)));
                    // photoPaths.push(path.join(__dirname, pixxPath.uploadPath.profileThumbnail, path.basename(rows[0].picture)));
                  } else {
                    // photoPaths.push(path.join(__dirname, pixxPath.uploadPath.profile, rows[0].picture));
                    // photoPaths.push(path.join(__dirname, pixxPath.uploadPath.profileThumbnail, rows[0].picture));
                    oldPhotoPath = rows[0].u_thumbnail;
                  }
                }
                 global.logger.debug("updateProfile photo getOldProfilePhotoPath");
                callback(null);

              }//end of if-else
            });// end of connection
          });// end of connection pool
        });//end of nextTick
      }, 
      function uploadProfilePhoto(callback){
        processS3UploadFiles(req, function(err, result) {
          if (err) {
            global.logger.error("[updateProfile] - profile photo - uploadProfilePhoto ==>",err);
            err.message = "프로필 사진 변경중 오류가 발생하였습니다.";
            callback(err);
          } else {
            // res.status(200);
            // res.json({
            //   error: null,
            //   data: {
            //     result : "Upload successful!!!",
            //     friends : result.formFields.friendIds,
            //     message : result.formFields.message,
            //     files : result.uploadFiles
            //   }
            // });

            // result.uploadFiles.push({
            //   "originalFileName" : originFileName,
            //   "realFilename" : realFileName,
            //   "s3URL" : s3URL, //s3에 저장된 url??
            // });
            newPhotoPath = result.uploadFiles[0].s3URL;
            global.logger.debug("updateProfile photo uploadProfilePhoto");
            callback(null);
          }
        });
      },
      function updateProfilePhotoPath(callback) {
        process.nextTick(function() {
          global.connectionPool.getConnection(function(err, connection) {
            if (err) {
              global.logger.error("[updateProfile] - profile photo - getConnection ==>",err);
              err.message = "프로필 사진 변경중 오류가 발생하였습니다.";
              return callback(err);
            }
            
            /* Table : user (사용자 정보 테이블)
             * Column :  u_thumbnail (사용자 프로필 사진), u_id (사용자 식별자)
             * SQL 설명 : 사용자의 프로필 사진경로를 저장합니다.*/
            var updateProfilePhotoPathSql = "update user set u_thumbnail=? where u_id=? ";
            connection.query(updateProfilePhotoPathSql, [ newPhotoPath, req.user.u_id ], function(err, result) {
              connection.release();
              if (err) {
                global.logger.error("[updateProfile] - profile photo - updateProfilePhotoPathSql ==>",err);
                err.message = "프로필 사진 변경중 오류가 발생하였습니다.";
                return callback(err);
              }
              global.logger.debug("updateProfile photo updateProfilePhotoPath");
              callback(null);
            });// end of connection
          });// end of connection pool
        });// end of process.nextTick
      },
      function deleteOldProfilePhoto(callback) {
        req.params.file = path.basename(oldPhotoPath);
        processS3DeleteFile(req,function(err) {
          if (err) {
            global.logger.error("[updateProfile] - profile photo - deleteOldProfilePhoto ==>",err);
            err.message = "프로필 사진 변경중 오류가 발생하였습니다.";
            return callback(err);
          } else {
            global.logger.debug("updateProfile photo deleteOldProfilePhoto");
            callback(null);
          }
        });
      }],
      function(err, result) {
        if (err) {
          return next(err);
        } 
        res.redirect('/profile/'+req.user.u_id);
      }
    );// end of asyc
  }// end of if
};




//router.route('/form/:u_id').get(getProfileForm);

/* profile 화면 요청 */
router.route('/:u_id').get(getProfile).post(updateProfile);

/* profile 수정 화면 요청 */
router.route('/form/edit/view').get(global.common.isLoggedIn, getProfileEidtForm);




module.exports = router;


