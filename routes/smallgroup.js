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



/* 
 member */
var updateMyMember = function(req, res, next) {
  if (req.headers['content-type'] === 'application/x-www-form-urlencoded') { //upload profile data
    var g_id = req.query.g_id;
    var m_id = req.params.m_id;
    var m_pos_name = req.body.m_pos_name;
    var m_intro = req.body.m_intro;
    var m_is_hp_open = req.body.m_is_hp_open;
    var m_is_birth_open = req.body.m_is_birth_open;
    m_is_hp_open=(m_is_hp_open==1)?1:0;
    m_is_birth_open=(m_is_birth_open==1)?1:0;
  

    process.nextTick(function() {
      global.connectionPool.getConnection(function(err, connection) {
        if (err) {
          global.logger.error("[updateMyMember] - getConnection ==>",err);
          err.message = "멤버 데이터 변경 중  오류가 발생하였습니다.";
          return callback(err);
        }
        /* Table : user (사용자 테이블)
         * Column : u_id (사용자 식별자)
         * SQL 설명 : 사용자의 프로필 사진 정보를 가져옵니다. 이는 사진 path 정보를 저장한 후, 추후에 삭제하기 위함입니다.*/
        
        var updateMemberSql=  "UPDATE member SET m_pos_name =?, m_intro=?, m_is_hp_open=?, m_is_birth_open=? WHERE m_id=? ";
        connection.query(updateMemberSql, [ m_pos_name, m_intro, m_is_hp_open, m_is_birth_open, m_id ], function(err, result) {
          connection.release();
          if (err) {
            global.logger.error("[updateMyMember] - updateMemberSql ==>",err);
            err.message = "멤버 데이터 변경 중  오류가 발생하였습니다.";
            return next(err);
          } else {
            res.redirect('/group/'+g_id);
          }//end of if-else
        });// end of connection
      });// end of connection pool
    });//end of nextTick
    
    
  }
};

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
          connection.beginTransaction(function(err) { //트랜잭션 시작
            if (err) {
              connection.release();
              global.logger.error("[makeGroup] - connectionPool==>",err);
              err.message = "Group 생성 중 오류가 발생하였습니다.";
              return next(err);
            }
            var insertSmallGroupSQL="INSERT INTO small_group(g_id, sg_name, sg_intro, sg_thumbnail, sg_parent_sg_id, sg_depth) values(?,?,?,?,?,?)";
            connection.query(insertSmallGroupSQL, [ g_id, sg_name, sg_intro, result.uploadFiles[0].s3URL, sg_id, sg_depth  ], function(err,info) {
              if (err) {
                connection.release();
                global.logger.error("[makeSmallGroup] - insertSmallGroupSQL ==>",err);
                err.message = "Small Group 생성 중 오류가 발생하였습니다.";
                return next(err);
              } else {
                var findParentSmallgroupSQL = 
                  "SELECT sg_first_child_sg_id "+ 
                  "FROM small_group "+
                  "WHERE sg_id = ? ";
                connection.query(findParentSmallgroupSQL, [ sg_id ], function(err, rows, fields){
                  if (err) {
                    connection.release();
                    global.logger.error("[makeSmallGroup] - findParentSmallgroupSQL ==>",err);
                    err.message = "Small Group 생성 중 오류가 발생하였습니다.";
                    return next(err);
                  } else {
                    global.logger.debug("[makeSmallGroup] - findParentSmallgroupSQL rows ==>",JSON.stringify(rows));
                    
                    if (rows[0].sg_first_child_sg_id == null) { // 값 없음.
                      //sg_first_child_sg_id 에 info.insertId 업데이트.
                      var updateParantSmallGroupSQL =
                        "UPDATE small_group SET sg_first_child_sg_id=? WHERE sg_id=? ";
                      connection.query(updateParantSmallGroupSQL, [ info.insertId, sg_id ], function(err, rows, fields){
                        connection.release();
                        if (err) {
                          global.logger.error("[makeSmallGroup] - updateParantSmallGroupSQL ==>",err);
                          err.message = "Small Group 생성 중 오류가 발생하였습니다.";
                          return next(err);
                        } else {
                          return res.redirect('/group/'+g_id+"/manage");
                        }
                      });// end of query - updateParantSmallGroupSQL
                    } else {
                      var smallGorupConnectionSgId=rows[0].sg_first_child_sg_id;
                      var smallGroupSiblingId;
                      async.whilst(
                        // 조건문.
                        function () {
                          return (smallGorupConnectionSgId!=null);
                        },  
                        // 실행문.
                        function (callback) {
                          var findSiblingSmallgroupSQL =
                            "SELECT sg_next_sibling_sg_id "+
                            "FROM small_group "+
                            "WHERE sg_id = ? ";
                          connection.query(findSiblingSmallgroupSQL, [ smallGorupConnectionSgId ], function(err, rows, fields){
                            if (err) {
                              callback(err);
                            } else {
                              if (rows[0].sg_next_sibling_sg_id == null) { //값 없음.
                                smallGroupSiblingId = smallGorupConnectionSgId;
                                smallGorupConnectionSgId=null;
                                callback();
                              } else {
                                smallGorupConnectionSgId=rows[0].sg_next_sibling_sg_id;
                                callback();
                              }
                            }
                          }); // end of query - findSiblingSmallgroupSQL
                        },
                        // 반복문 완료시 또는 에러 발생시 호출.
                        function (err) {
                          if(err) {
                            connection.release();
                            err.message = "Small Group 생성 중 오류가 발생하였습니다.";
                            return next(err);
                          }
                          //sg_next_sibling_sg_id 에 info.insertId 업데이트.
                          var updateSiblingSmallGroupSQL = "UPDATE small_group SET sg_next_sibling_sg_id=? WHERE sg_id=? ";
                          connection.query(updateSiblingSmallGroupSQL, [ info.insertId, smallGroupSiblingId ], function(err, rows, fields){
                            connection.release();
                            if (err) {
                              global.logger.error("[makeSmallGroup] - updateSiblingSmallGroupSQL ==>",err);
                              err.message = "Small Group 생성 중 오류가 발생하였습니다.";
                              return next(err);
                            } else {
                              return res.redirect('/group/'+g_id+"/manage");
                            }
                          });// end of query - updateSiblingSmallGroupSQL
                        }
                      );// end of async until
                    } // end of if-else
                  }// end of if-else
                });// end of query - findParentSmallgroupSQL
              } // end of if-else
            });//end of query - insertSmallGroupSQL
          });//end of beginTransaction
        });//end of connectionPool
      });// end of process.nextTick
    });// end of processS3UploadFiles
  }
};


var acceptJoinRequestMember = function(req, res, next) {
  var m_id = req.params.m_id;
  var sg_id = req.body.sg_id;
  var g_id= req.body.g_id;
  var u_id = req.user.u_id;
  
  
  process.nextTick(function() {
    global.connectionPool.getConnection(function(err, connection) {
      if (err) {
        global.logger.error("[acceptJoinRequestMember] - getConnection ==>",err);
        err.message = "그룹 가입 수락 중 오류가 발생하였습니다.";
        return callback(err);
      }
      /* Table : user (사용자 테이블)
       * Column : u_id (사용자 식별자)
       * SQL 설명 : 사용자의 프로필 사진 정보를 가져옵니다. 이는 사진 path 정보를 저장한 후, 추후에 삭제하기 위함입니다.*/
      
      var acceptMemberSql= "UPDATE member SET m_isapproved=1, m_pos_name='member', sg_id =? WHERE m_id=? ";
      connection.query(acceptMemberSql, [ sg_id, m_id ], function(err, result) {
        connection.release();
        if (err) {
          global.logger.error("[acceptJoinRequestMember] - acceptMemberSql ==>",err);
          err.message = "그룹 가입 수락 중 오류가 발생하였습니다.";
          return next(err);
        } else {
          res.redirect('/group/'+g_id+"/manage");
        }//end of if-else
      });// end of connection
    });// end of connection pool
  });//end of nextTick
};

var refuseJoinRequestMember = function(req, res, next) {
  var m_id = req.params.m_id;
  var g_id= req.query.g_id;
  
  global.logger.debug("[refuseJoinRequestMember] - m_id ==>",m_id);
  global.logger.debug("[refuseJoinRequestMember] - g_id ==>",g_id);
  var u_id = req.user.u_id;
  
  
  process.nextTick(function() {
    global.connectionPool.getConnection(function(err, connection) {
      if (err) {
        global.logger.error("[refuseJoinRequestMember] - getConnection ==>",err);
        err.message = "그룹 가입 거절 중 오류가 발생하였습니다.";
        return callback(err);
      }
      /* Table : user (사용자 테이블)
       * Column : u_id (사용자 식별자)
       * SQL 설명 : 사용자의 프로필 사진 정보를 가져옵니다. 이는 사진 path 정보를 저장한 후, 추후에 삭제하기 위함입니다.*/
      
      var refuseMemberSql= "DELETE FROM member WHERE m_id=? ";
      connection.query(refuseMemberSql, [m_id ], function(err, result) {
        connection.release();
        if (err) {
          global.logger.error("[refuseJoinRequestMember] - refuseMemberSql ==>",err);
          err.message = "그룹 가입 거절 중 오류가 발생하였습니다.";
          return next(err);
        } else {
          res.redirect('/group/'+g_id+"/manage");
        }//end of if-else
      });// end of connection
    });// end of connection pool
  });//end of nextTick
};

/* 소그룹 생성하기 */
router.route('/').post(makeSmallGroup);

/* 그룹 내의 멤버 정보 수정 요청 */
router.route('/:m_id').post(updateMyMember);

/* 가입 수락 */
router.route('/:m_id/accept').post(acceptJoinRequestMember);

/* 가입 거절 */
router.route('/:m_id/refuse').get(refuseJoinRequestMember);





module.exports = router;


