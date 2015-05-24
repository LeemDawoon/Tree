var express = require('express');
var router = express.Router();

/*모듈 로딩*/
var async = require('async');
var path = require('path');


var treePath = require('../config/tree_path');
var serverHost = require('../config/server').serverHost;

var processS3UploadFiles = require('../lib/common').processS3UploadFiles;
var processS3DeleteFile  = require('../lib/common').processS3DeleteFile;


	
var getMakeGroupForm = function (req, res, next) {
  res.render('makeGroupForm', {
    my_u_name: req.user.u_name,
		my_u_id: req.user.u_id,
		my_u_thumbnail : req.user.u_thumbnail
	});
};
	

/**
 * Name : makeGroup
 * Description : Group 처음 생성과정 
 * URL : group
 * Method : POST
 * 인증 : O
 * Parameters : g_name(Group이름), g_intro(Group설명), pict(Group Cover 사진)
 **/
var makeGroup = function(req, res, next){
	if (req.headers['content-type'] === 'application/x-www-form-urlencoded') { 
	} else {
		req.imageDir = treePath.uploadPath.forest;
		processS3UploadFiles(req, function(err, result) {
			var g_name=result.formFields.g_name;
			var g_intro = result.formFields.g_intro	
			var my_u_id = req.user.u_id;
			process.nextTick(function() {
				global.connectionPool.getConnection(function(err, connection) {
					if (err) {
						connection.release();
						err.message = "Group 생성 중 오류가 발생하였습니다.";
						global.logger.error("[makeGroup] - connectionPool==>",err);
						return next(err);
					}

					connection.beginTransaction(function(err) { //트랜잭션 시작
						if (err) {
						  global.logger.error("[makeGroup] - connectionPool==>",err);
						  err.message = "Group 생성 중 오류가 발생하였습니다.";
						  return next(err);
						}

//						var g_id;
//						var sg_id;
						async.waterfall([
              function insertGroup(callback) {
                var insertGroupSql="";
                var insertGroupSqlData=[g_name, g_intro];
                if (result.uploadFiles[0].s3URL) {
                  insertGroupSql = "INSERT INTO ggroup (g_name, g_intro, g_thumbnail) VALUES(?,?,?)";	
			  				  insertGroupSqlData.push(result.uploadFiles[0].s3URL);
                } else {
			  				  insertGroupSql = "INSERT INTO ggroup (g_name, g_intro) VALUES(?,?)";
                }
                connection.query(insertGroupSql,insertGroupSqlData,function(err, info) {
					        if (err) {
					          global.logger.error("[makeGroup] - insertGroup ==>",err);
					         	callback(err);
					        } else { 
					          callback(null, info.insertId);
				       		} //end of if,else
                });// end of connection.query(insert)              
					   	},
					   	function insertSmallGroup(g_id, callback){    // tags 테이블에 삽입        
				        var insertSmallGroupSql="INSERT INTO small_group(g_id, sg_name) values(?,?)";
			         	connection.query(insertSmallGroupSql, [ g_id, "root" ], function(err,info) {
			         	  if (err) {
			         	    global.logger.error("[makeGroup] - insertSmallGroup ==>",err);
			           		callback(err);
			         	  } else {
			         	    callback(null, info.insertId);	
			           	} 
			         	});
					   	}, 
					   	function insertMember(sg_id, callback) {
                var insertMemberSql="INSERT INTO member(u_id, sg_id,  m_isapproved, m_req_date, m_app_date, m_pos_name, m_is_sg_manager, m_is_g_manager, m_is_g_master_manager " +
                            "VALUES(?,?, 1 , now(), now(), 'Master Group Manager', 1, 1, 1)";
                connection.query(insertMemberSql, [ my_u_id, sg_id ], function(err,info) {
                  if (err) {
                    global.logger.error("[makeGroup] - insertMemberSql ==>",err);
                    callback(err);
                  } else {
                    callback(null); 
                  } 
                });
              },
					   	
              function(callback) {
                connection.commit(function(err) { //  성공한다면 commit
                  if (err) {
                    callback(err);
				           	return;
				         	}
				       	});
				       	global.logger.debug('makeGroup commit 되었습니다.');
				       	callback(null);
				      }],
				      function(err, result) {
						    if (err) {//에러!! 롤백!
						      connection.rollback(function() {
						        err.message = "Group 생성 중 오류가 발생하였습니다.";
						        connection.release();
						        return next(err);
						      });
						    } else {
						      res.redirect(path.join('/profile/'+req.user.u_id));
				        }
				      }
						);//end of async
					});//end of beginTransaction
				});//end of connectionPool
			});// end of process.nextTick
		});// end of processS3UploadFiles
	}//end of else if
};

var checkNameDuplication = function (req, res, next) {
	var g_name = req.query.g_name;

	process.nextTick(function() {
		global.connectionPool.getConnection(function(err, connection){
	      var t_id = req.user.t_id;
	      if (err) {
	        global.logger.error("[checkNameDuplication] - connectionPool ==>",err);
	        err.message = "Group 이름 중복체크 중 오류가 발생하였습니다.";
	        return next(err);
	      }

	      /* Table : fores(Group 정보 테이블)
	       * Column :  g_name (숲이름)
	       * SQL 설명 : 입력한 이름을 가진 Group가 있는지 검색한다.*/
	      var checkNameOfGroupSql = "SELECT g_id From ggroup WHERE g_name=?";
	      connection.query(checkNameOfGroupSql, [g_name], function(err, rows, fields){
	        connection.release();
	        if (err) {
	          global.logger.error("[checkNameDuplication] - checkNameOfGroupSql ==>", err);
	          err.message = "Group 이름 중복체크 중 오류가 발생하였습니다.";
	          return next(err);
	        } else {
	        	res.json({
	        		is_ok : (rows.length)?0:1
	        	});
	        }
	      });// end of query

	    });
	});
};


/**
 * Name : getGroup
 * Description : Group 식별자에 해당하는 정보를 가져와서, group.html 화면에 뿌려준다.
 * URL : group/g_id
 * Method : GET
 * 인증 : O
 * Parameters : g_id(식별자.)
 **/
var getGroup = function (req, res, next) {
  var g_id = req.params.g_id;
  process.nextTick(function() {
    global.connectionPool.getConnection(function(err, connection){
      if (err) {
      global.logger.error("[getGroup] - connectionPool ==>",err);
      err.message = "Group 정보요청 중 오류가 발생하였습니다.";
      return next(err);
      }

      async.waterfall([
        function getGroupData(callback) {
          /* Table : group(Group 정보 테이블)
             * Column :  g_name (숲이름)
             * SQL 설명 : 숲 식별자에 해당하는 정보 가져 오기*/
            var getGroupDataSql = 
              "select g_id, g_name, g_thumbnail, g_intro, "+
              "(  SELECT count(distinct mm.u_id) "+ 
              "FROM member mm JOIN small_group sgsg JOIN ggroup gg ON (mm.sg_id = sgsg.sg_id AND gg.g_id=sgsg.g_id) "+ 
              "WHERE gg.g_id=? "+ 
              ") g_count "+ 
              "from ggroup where g_id=?";
            connection.query(getGroupDataSql, [g_id, g_id], function(err, rows, fields){
                if (err) {
                    global.logger.error("[getGroup] - getGroupDataSql ==>", err);
                    err.message = "Group 정보요청 중 오류가 발생하였습니다.";
                    callback(err);
                } else {
                  if (!rows.length) {
                    err={};
                    global.logger.error("[getGroup] - getGroupDataSql ==>", "검색된 Group 정보가 없습니다.");
                    err.message="검색된 Group 정보가 없습니다.";
                    callback(err);
                  } else {
                    callback(null, rows[0]);  
                  }
                  
                }
            });// end of query
        },
        function getSmallGroupAndMembershipData (groupData, callback) {
          var smallgroups=[];
          /* Table : smallgroup,  membership,  tree,
           * Column :   
                  sg_id:,
                  sg_depth:,
                  sg_name:,
                  sg_master_manager_m_id,
                  sg_parent_sg_id:,
                  sg_first_child_sg_id:,
                  sg_next_sbling_sg_id:,

           * SQL 설명: 특정 숲의 소그룹 정보
           **/
          var getSmallgroupDataSql = 
            "SELECT sg_id, sg_depth, sg_name, sg_intro, sg_thumbnail, sg_parent_sg_id, sg_first_child_sg_id, sg_next_sibling_sg_id "+
            "FROM small_group "+ 
            "WHERE g_id=? "+
            "ORDER BY sg_depth, sg_name";
          connection.query(getSmallgroupDataSql, [g_id], function(err, rows, fields){
                if (err) {
                    global.logger.error("[getGroup] - getSmallgroupDataSql ==>", err);
                    err.message = "Group 정보요청 중 오류가 발생하였습니다.";
                    callback(err);
                } else {
                  if (!rows) {
                    err={};
                    global.logger.error("[getGroup] - getSmallgroupDataSql ==>", "검색된 smallgroup 정보가 없습니다.");
                    err.message="검색된 smallgroup 정보가 없습니다.";
                    callback(err);
                  } else {
                    async.each(rows, function(smallgroup, innerCallback){
                      /* Table : smallgroup,  membership,  tree,
                   * Column : 
                        m_id:,
                        m_pos_name:,
                        m_intro:,
                        u_id:,
                        u_thumbnail:,
                        u_name:,
                        u_email:,
                        u_hp:,    //m_is_hp_open
                        u_birth:  //m_is_birth_open
                        u_fb_link:  //m_is_fblink_open 에 따라서 
                   * SQL 설명: 특정 숲의 특정 소그룸의 멤버 정보
                   **/
                      
                      var membershipDataSql = 
                        "SELECT m_id, m_pos_name, m_intro, m_is_sg_manager, m_is_g_manager, m_is_g_master_manager, u.u_id, u_thumbnail, u_name, u_email, "+ 
                        "(CASE m_is_hp_open WHEN 1 THEN u_hp ELSE null END) u_hp, "+
                        "(CASE m_is_birth_open WHEN 1 THEN u_birth ELSE null END) u_birth, "+ 
                        "(CASE m_is_fblink_open WHEN 1 THEN CONCAT('http://www.facebook.com/',u_fb_id) ELSE null END) u_fb_link "+ 
                        "FROM user u JOIN member m ON(u.u_id = m.u_id)  "+
                        "WHERE m_isapproved=1 AND sg_id=? " +
                        "ORDER BY m_is_g_master_manager DESC, m_is_g_manager DESC, m_is_sg_manager DESC , u_name ASC ";
                      connection.query(membershipDataSql, [smallgroup.sg_id], function(err, rows, fields){
                        if (err) {
                            global.logger.error("[getGroup] - membershipDataSql ==>", err);
                            err.message = "Membership 정보요청 중 오류가 발생하였습니다.";
                            innerCallback(err);
                        } else {
                          smallgroup.members = rows;
                          smallgroups.push(smallgroup);
                          innerCallback();  
                        }
                      });// end of query                  
                    }, function(err){
                      if (err) {
                        callback(err);
                      } else {
                        groupData.smallgroups = smallgroups;
                        callback(null, groupData); 
                      }
                    }); // end of async.each
                  } // end of if-else
                }// end of if-else
            });// end of query  
        }],
        function(err, result){
          connection.release();
          if (err) {
            next(err);
          } else {
            res.render('group', 
                {
                  'my_u_id': req.user.u_id,
                  'my_u_name' : req.user.u_name,
                  'my_u_thumbnail': req.user.u_thumbnail,
                  'g_id':g_id,
                  'data_group': JSON.stringify(result)
                });
          }
        });// end of async
      });
  });// end of process.nextTick
};

/**
 * Name : updateGroup
 * Description : Group 정보를 수정한다.
 * URL : group/g_id
 * Method : POST
 * 인증 : O
 * Parameters : :g_id(식별자), g_thumbnail, g_name, g_intro 
 **/
var updateGroup = function (req, res, next) {
  var g_id = req.params.g_id;
  if (req.headers['content-type'] === 'application/x-www-form-urlencoded') { //upload profile data
  } else { //upload profile photo
    req.imageDir = treePath.uploadPath.forest;
    req.imageThumbDir = treePath.uploadPath.forest_thumb;
    var oldPhotoPath;
    var newPhotoPath;
    var g_name;
    var g_intro; 
    async.series([
      function getOldGroupPhotoPath(callback) {
        process.nextTick(function() {
          global.connectionPool.getConnection(function(err, connection) {
            if (err) {
              global.logger.error("[updateGroup] - getConnection ==>",err);
              return callback(err);
            }
            /* Table : user (사용자 테이블)
             * Column : u_id (사용자 식별자)
             * SQL 설명 : 사용자의 프로필 사진 정보를 가져옵니다. 이는 사진 path 정보를 저장한 후, 추후에 삭제하기 위함입니다.*/
            var getOldGroupPhotoPathSql=  "SELECT g_thumbnail From ggroup WHERE g_id=? ";
            connection.query(getOldGroupPhotoPathSql, [ g_id ], function(err, rows, fields){
              connection.release();
              if (err) {
                global.logger.error("[updateGroup] ß- getOldGroupPhotoPathSql ==>",err);
                callback(err);
              } else {
                if (rows[0].g_thumbnail) {
                  if (req.user.u_fb_id) {
                    // photoPaths.push(path.join(__dirname, pixxPath.uploadPath.profile, path.basename(rows[0].picture)));
                    // photoPaths.push(path.join(__dirname, pixxPath.uploadPath.profileThumbnail, path.basename(rows[0].picture)));
                  } else {
                    // photoPaths.push(path.join(__dirname, pixxPath.uploadPath.profile, rows[0].picture));
                    // photoPaths.push(path.join(__dirname, pixxPath.uploadPath.profileThumbnail, rows[0].picture));
                    oldPhotoPath = rows[0].g_thumbnail;
                  }
                }
                 global.logger.debug("updateGroup photo getOldGroupPhotoPath");
                callback(null);
              }//end of if-else
            });// end of connection
          });// end of connection pool
        });//end of nextTick
      }, 
      function uploadGroupPhoto(callback){
        processS3UploadFiles(req, function(err, result) {
          g_name = result.formFields.g_name;
          g_intro = result.formFields.g_intro 
          if (err) {
            global.logger.error("[updateGroup] - uploadGroupPhoto ==>",err);
            callback(err);
          } else {
            newPhotoPath = result.uploadFiles[0].s3URL;
            global.logger.debug("updateGroup photo uploadGroupPhoto");
            callback(null);
          }
        });
      },
      function updateGroupPhotoPath(callback) {
        process.nextTick(function() {
          global.connectionPool.getConnection(function(err, connection) {
            if (err) {
              global.logger.error("[updateGroup] - profile photo - getConnection ==>",err);
              return callback(err);
            }
            
            /* Table : user (사용자 정보 테이블)
             * Column :  u_thumbnail (사용자 프로필 사진), u_id (사용자 식별자)
             * SQL 설명 : 사용자의 프로필 사진경로를 저장합니다.*/
            var updateGroupPhotoPathSql = "update ggroup set g_thumbnail=? where g_id=? ";
            connection.query(updateGroupPhotoPathSql, [ newPhotoPath, g_id ], function(err, result) {
              connection.release();
              if (err) {
                global.logger.error("[updateGroup] - updateGroupPhotoPathSql ==>",err);
                return callback(err);
              }
              global.logger.debug("updateGroup photo updateGroupPhotoPath");
              callback(null);
            });// end of connection
          });// end of connection pool
        });// end of process.nextTick
      },
      function deleteOldGroupPhoto(callback) {
        req.params.file = path.basename(oldPhotoPath);
        processS3DeleteFile(req,function(err) {
          if (err) {
            global.logger.error("[updateGroup] - deleteOldGroupPhoto ==>",err);
            return callback(err);
          } else {
            global.logger.debug("updateProfile photo deleteOldProfilePhoto");
            callback(null);
          }
        });
      },
      function updateGroupInfo(callback) {
        process.nextTick(function() {
          global.connectionPool.getConnection(function(err, connection) {
            if (err) {
              global.logger.error("[updateGroup] - profile photo - getConnection ==>",err);
              return callback(err);
            }
            
            /* Table : user (사용자 정보 테이블)
             * Column :  u_thumbnail (사용자 프로필 사진), u_id (사용자 식별자)
             * SQL 설명 : 사용자의 프로필 사진경로를 저장합니다.*/
            var updateGroupInfoSql = "update ggroup set g_name=?, g_intro=? where g_id=? ";
            connection.query(updateGroupInfoSql, [ g_name, g_intro, g_id ], function(err, result) {
              connection.release();
              if (err) {
                global.logger.error("[updateGroup] - updateGroupInfoSql ==>",err);
                return callback(err);
              }
              global.logger.debug("updateGroup updateGroupInfo");
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
        res.redirect('/group/'+g_id);
      }
    );// end of asyc
  }// end of if
};


/* Get Make a Group Form */
/* Make a Group */
router.route('/').get(getMakeGroupForm).post(global.common.isLoggedIn,makeGroup);

/* Group Name check */
router.route('/check/nameDuplication').get(checkNameDuplication);

/* Get Group */
router.route('/:g_id').get(global.common.isLoggedIn, getGroup).post(global.common.isLoggedIn, updateGroup);

module.exports = router;

