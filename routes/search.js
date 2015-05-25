var express = require('express');
var router = express.Router();

/*모듈 로딩*/
var async = require('async');



var searchAll = function (req, res, next) {
  var keyword = "%"+req.query.keyword+"%";
  var page = req.query.page;
  
  if (!page) {
    page='0';
  }
  
  process.nextTick(function() {
    global.connectionPool.getConnection(function(err, connection){
      
      if (err) {
        global.logger.error("[searchAll] - connectionPool ==>",err);
        err.message = "searchAll 중 오류가 발생하였습니다.";
        return next(err);
      }
      
      async.waterfall([
        function getSearchMember(callback) {
          /* Table : member(소그룹 소속 멤버 정보.), small_group(소그룹 정보.), group(그룹 정보.)
           * Column :  g_id(숲 아이디.), g_name(숲 이름.), g_intro(숲 소개.), g_thumbnail(숲 커버 이미지.), g_count(숲 가입 멤버수.) 
           * SQL 설명 : 숲가입 멤버수로 정렬된, 그룹 리스트를 보여준다.*/
          var getSearchMemberSQL =  
            "SELECT u_id, u_name, u_email, u_thumbnail FROM user WHERE u_name LIKE ? OR u_email LIKE ? " +
            "ORDER BY u_name, u_email " +
            "LIMIT ?, 10" ;
          connection.query(getSearchMemberSQL, [ keyword, keyword, parseInt(page) ], function(err, rows, fields){
            if (err) {
              global.logger.error("[searchAll] - getSearchMember ==>", err);
              return callback(err);
            } else {
              
              global.logger.debug("[searchAll] - getSearchMember ==>", rows[0]);
              search_result={};
              search_result.member_list = rows;
              callback(null, search_result);
            }
          });// end of query
        },
        function getSearchGroup(search_result, callback) {
          var getSearchGroupSQL = 
            "SELECT g.g_id, g.g_name, g.g_intro, g.g_thumbnail, g.g_is_open, count(m.u_id) g_count " +
            "FROM member m JOIN small_group sg JOIN ggroup g ON (m.sg_id = sg.sg_id AND g.g_id=sg.g_id) " + 
            "WHERE g_name LIKE ? " +
            "GROUP BY g.g_id " +  
            "ORDER BY g_name " + 
            "LIMIT ?, 10";
            
          connection.query(getSearchGroupSQL, [ keyword, parseInt(page) ], function(err, rows, fields){
            if (err) {
              global.logger.error("[searchAll] - getSearchGroup ==>", err);
              return callback(err);
            } else {
              search_result.group_list=rows;
              callback(null, search_result);
            }
          });// end of query
          
        }
      ],function(err,result){
        connection.release();
        if(err) {
          err.message = "explore 중 오류가 발생하였습니다.";
          return next(err);
        }
        
        if (req.isAuthenticated()) {
          res.render('searchLoggedIn', {
            my_u_id:req.user.u_id,
            my_u_name: req.user.u_name,
            my_u_thumbnail:req.user.u_thumbnail,
            search_result : JSON.stringify(result),
          });
        } else {
          res.render('searchLoggedOut', {
            search_result : JSON.stringify(result),
          });
        }
        
        
      });
      

      
    });
  });// end of nextTick  
  
};

	


/* Get Make a Forest Form */
/* Make a Forest */
router.route('/').get(searchAll)


module.exports = router;

