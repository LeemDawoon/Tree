var express = require('express');
var router = express.Router();

/*모듈 로딩*/
var async = require('async');


var explore = function (req, res, next) {
  
  var page = req.query.page;
  if (!page) {
    page='0';
  }
  global.logger.debug('explore=============================>');  
  process.nextTick(function() {
    global.connectionPool.getConnection(function(err, connection){
      
      if (err) {
        global.logger.error("[explore] - connectionPool ==>",err);
        err.message = "explore 중 오류가 발생하였습니다.";
        return next(err);
      }
      
      async.waterfall([
        function getExploreGroupList(callback) {
          /* Table : member(소그룹 소속 멤버 정보.), small_group(소그룹 정보.), group(그룹 정보.)
           * Column :  g_id(숲 아이디.), g_name(숲 이름.), g_intro(숲 소개.), g_thumbnail(숲 커버 이미지.), g_count(숲 가입 멤버수.) 
           * SQL 설명 : 숲가입 멤버수로 정렬된, 그룹 리스트를 보여준다.*/
          var getExploreGroupListSQL =  "SELECT g.g_id, g.g_name, g.g_intro, g.g_thumbnail, count(distinct m.u_id) g_count " +
                                      "FROM member m JOIN small_group sg JOIN ggroup g ON (m.sg_id = sg.sg_id AND g.g_id=sg.g_id) " +
                                      "GROUP BY g.g_id " +
                                      "ORDER BY g_count desc " +
                                      "LIMIT ?, 10";
          connection.query(getExploreGroupListSQL, [parseInt(page)], function(err, rows, fields){
            if (err) {
              global.logger.error("[explore] - getExploreGroupList ==>", err);
              return callback(err);
            } else {
              
              global.logger.debug("[explore] - getExploreGroupList ==>", rows[0]);
              exploreGroupList={};
              exploreGroupList.group_list = rows;
              callback(null, exploreGroupList);
            }
          });// end of query
        },
        function getExploreGroupListRowCount(exploreGroupList, callback) {
          var getExploreGroupListRowCountSQL = "SELECT COUNT(group_list.g_id) AS group_list_count " + 
                                                "FROM ( "+
                                                "    SELECT g.g_id "+
                                                "    FROM member m JOIN small_group sg JOIN ggroup g ON (m.sg_id = sg.sg_id AND g.g_id=sg.g_id) "+
                                                "    GROUP BY g.g_id "+
                                                "    ) group_list ";
          connection.query(getExploreGroupListRowCountSQL, [], function(err, rows, fields){
            if (err) {
              global.logger.error("[explore] - getExploreGroupList ==>", err);
              return callback(err);
            } else {
              exploreGroupList.group_list_count=rows[0].group_list_count;
              callback(null, exploreGroupList);
            }
          });// end of query
          
        }
      ],function(err,result){
        connection.release();
        if(err) {
          err.message = "explore 중 오류가 발생하였습니다.";
          return next(err);
        }
        
        res.render('explore', {
          group_list : JSON.stringify(result.group_list),
          group_list_count : result.group_list_count,
        });
        
      });
      

      
    });
  });// end of nextTick  
};

  


/* Get Make a Group Form */
/* Make a Group */
router.route('/').get(explore);


module.exports = router;

