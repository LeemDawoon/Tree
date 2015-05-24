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



/* update member */
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
        connection.query(updateMemberSql, [ m_pos_name, m_intro, m_is_hp_open, m_is_birth_open, m_id ], function(err, rows, fields){
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




router.route('/:m_id').post(updateMyMember);





module.exports = router;


