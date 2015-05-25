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

var reqestMember = function(req, res, next) {
  var g_id = req.query.g_id;
  var u_id = req.user.u_id;
  
  
  process.nextTick(function() {
    global.connectionPool.getConnection(function(err, connection) {
      if (err) {
        global.logger.error("[reqestMember] - getConnection ==>",err);
        err.message = "그룹 가입 요청 중 오류가 발생하였습니다.";
        return callback(err);
      }
      /* Table : user (사용자 테이블)
       * Column : u_id (사용자 식별자)
       * SQL 설명 : 사용자의 프로필 사진 정보를 가져옵니다. 이는 사진 path 정보를 저장한 후, 추후에 삭제하기 위함입니다.*/
      
      var insertMemberSql=  "INSERT INTO member (u_id,g_id, m_pos_name) VALUES(?,?,?)";
      connection.query(insertMemberSql, [ u_id, g_id, "member" ], function(err, result) {
        connection.release();
        if (err) {
          global.logger.error("[reqestMember] - insertMemberSql ==>",err);
          err.message = "그룹 가입 요청 중 오류가 발생하였습니다.";
          return next(err);
        } else {
          res.redirect('/profile/'+u_id);
        }//end of if-else
      });// end of connection
    });// end of connection pool
  });//end of nextTick
  
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

/* 그룹 가입 요청 */
router.route('/').get(reqestMember);

/* 그룹 내의 멤버 정보 수정 요청 */
router.route('/:m_id').post(updateMyMember);

/* 가입 수락 */
router.route('/:m_id/accept').post(acceptJoinRequestMember);

/* 가입 거절 */
router.route('/:m_id/refuse').get(refuseJoinRequestMember);





module.exports = router;


