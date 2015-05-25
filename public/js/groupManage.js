$( document ).ready(function () {
  var data_group = JSON.parse($('#data_group').val());
  var group = new Group(data_group);

  
  $('#g_name').html(group.g_name+' <small><span class="fa fa-users">'+group.g_count+'</small> <span>');

  group.buildingTreeSmallgroup();
//  group.drawSmallgroups();
  thisPageCache.group = group;
  
  var my_u_id = $('#my_u_id').val();
  var smallgroups = group.smallgroups
  for (var i=0, lengthOfSmallgroups = smallgroups.length; i<lengthOfSmallgroups; i++) {
    for (var j=0, lengthOfMembers=smallgroups[i].members.length; j<lengthOfMembers; j++) {
      if( smallgroups[i].members[j].u_id == my_u_id) {
        thisPageCache.myMember = smallgroups[i].members[j];
        break;
      }
    }
  }
  group.drawGroupManage();
});

/**
 * dw-tree2015-building.js
 * 
 * 입력 객체
{
  g_id
  g_name
  g_thumbnail
  g_intro
  g_master_manager_m_id
  g_count
  smallgroups : 
  [
    {
      sg_id:,
      sg_depth:,
      sg_name:,
      sg_intro:,
      sg_thumbnail:,
      sg_master_manager_m_id:;
      sg_parent_sg_id:,
      sg_first_child_sg_id:,
      sg_next_sibling_sg_id:,
      
      members:    //m_isapproved가 1인 member 데이터만
      [ {   
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
        },
        {..... 
      ]
    }, 
    { .....
  ]
}* 
 */



var dw_common = {
  screenHeight : (window.innerHeight || self.innerHeight || document.documentElement.clientHeight || document.body.clientHeight),
  screenWidth : (window.innerWidth || self.innerWidth || document.documentElement.clientWidth || document.body.clientWidth),
  topNavigationBarHeight: 50,
  thumbnailSize50 : 50, 
  thumbnailSize60 : 60,
};

var contentEl=$("#content");
var modalEl = $("#modal");


var thisPageCache={};
//var  r = Raphael("holder", dw_common.screenWidth, dw_common.screenHeight-dw_common.topNavigationBarHeight);




function memberProfile (sInd, mInd) {

  var smallgroupIndex = parseInt(sInd);
  var memberIndex = parseInt(mInd);

      modalEl.html(thisPageCache.group.smallgroups[smallgroupIndex].members[memberIndex].modal_contents);
          // if(is_enable_request_btn){
            // $("#send_span").html(" <span class=\"glyphicon glyphicon-send\" id=\"send_btn\"  onclick=\"send_request_to_tree_of_the_group('"+this.data("email")+"','"+this.data("g_email")+"','"+this.data("g_name")+"')\"></span>");
            
          // }
      $('#profile_modal').modal('show');

}

// 변수에 저장해 놓고, "g_id" 에 해당하하는 값 없음. 아작스 요청하는 것도 좋겠군




/* 설정 페이지. */
function openMyPageAtGroup () {
 
  if (!window.localStorage ) {
//           alert('당신의 브라우저는 HTML5 localStorage를 지원하지 않습니다. 브라우저를 업그레이드하세요.');
    } else {
          // localStorage.setItem("u_id",u_id);
//                alert('당신의 브라우저는 HTML5 localStorage를 지원');
//                alert(window.localStorage.u_id);
//                alert(group.g_master_manager_m_id+" : "+group.my_m_id);
    }

  var myMember = thisPageCache.myMember;
  var text = 
    "<div class='modal fade'  id='myPageAtGroup_modal'  tabindex='-1' role='dialog' aria-labelledby='myModalLabel' aria-hidden='true'> " +
      "<span class='btn btn-sm' id='close_btn' data-dismiss='modal' aria-hidden='true'>×</span> " +
      "<div id='profile_contents'> " +
        "<div class='col-md-6 col-xs-12'>" +
          "<ul class='list-unstyled'>" +
            "<li><p class='text-left'><small>Group</small><hr/></p></li>" +
            "<li class='row'>" +
              "<div class='col-xs-4 col-md-2 '>" +
                "<img class='img-rounded size-70 ' src='"+group.g_thumbnail+"'/> " +
              "</div>" +
              "<div class='col-xs-6 col-md-8 '>" +
                "<h4>"+group.g_name+"</h4>" ;

  if(group.g_intro) {
    text+=      "<small>\" "+group.g_intro+" \"</small>";
  }
  text +=
  
              "</div>" +
              "<div class='col-xs-2 col-md-2 '>";
  if (myMember.m_is_g_master_manager==1) {
    text +=     "<a class='btn btn-warning btn-sm' href=''>수정 </a>" +
                "<a class='btn btn-danger btn-sm' href=''>삭제 </a>" ;
  }
              
  text +=     "</div>" +
            "</li>" + //end of row
            "<li><br/><p class='text-left'><small>Small Group</small></p><hr/></li>" ;
 
//  var smallgroups = group.smallgroups
  for (var i=0, length = smallgroups.length; i<length; i++) {
    text+=  "<li class='row'>" +
              "<div class='col-xs-4 col-md-2 '>" +
                "<img class='img-rounded size-70 ' src='"+smallgroups[i].sg_thumbnail+"'/> " +
              "</div>" +
              "<div class='col-xs-6 col-md-8 '>" +
                "<h4>"+smallgroups[i].sg_name+"</h4>" ;
    if(smallgroups[i].sg_intro) {
      text+=    "<small>\" "+smallgroups[i].sg_intro+" \"</small>";
    }
    
    text+=
              "</div>" +
              "<div class='col-xs-2 col-md-2 '>" +
                "<a class='btn btn-warning btn-sm' href=''>수정 </a>" +
                "<a class='btn btn-danger btn-sm' href=''>삭제 </a>" +
              "</div>" +
            "</li>";
    
    text+=  "<li class='row'>" +
              "<div class='col-xs-4 col-md-2 '>" +
                "<img class='img-circle size-70 ' src='"+smallgroups[i].members[0].u_thumbnail+"'/> " +
              "</div>" +
              "<div class='col-xs-6 col-md-8 '>" +
                "<h4>"+smallgroups[i].members[0].u_name+"</h4>" ;
    if(smallgroups[i].sg_intro) {
      text+=    "<small>\" "+smallgroups[i].members[0].sg_intro+" \"</small>";
    }
    
    text+=
              "</div>" +
              "<div class='col-xs-2 col-md-2 '>" +
                "<a class='btn btn-info btn-sm' href=''>권한변경 </a>" +
              "</div>" +
            "</li>";
  }//end of for

  text+=
            "<li class='btn btn-default'>+ Make a New Small Group</li>"+
            "<li><br/><p class='text-left'><small>My Member Info </small><hr/></p></li>" +
            
            "<li class='row'>" +
              "<div class='col-xs-4 col-md-2 '>" +
                "<img class='img-circle size-70 ' src='"+myMember.u_thumbnail+"'/> " +
              "</div>" +
              "<div class='col-xs-6 col-md-8 '>" +
                "<h4>" + myMember.u_name+ "</h4>" +
                "<small>"+myMember.u_pos_name+"</small><br/>" +
                "<small>"+myMember.m_intro+"</small><br/>" +
                "<i class='fa fa-phone'></i><br/>" +
                "<i class='fa fa-birthday-cake'></i>" +
              "</div>" +
              "<div class='col-xs-2 col-md-2 '>" +
                "<br/>" +
                "<a class='btn btn-warning btn-sm' href=''>수정 </a>" +
                "<a class='btn btn-warning btn-sm' href=''>수정 </a><br/>" +
                "<input type='checkbox' aria-label='...'><br/>" +
                "<input type='checkbox' aria-label='...'>" +
              "</div>" +
            "</li>" +
          "</ul>"+
        "</div>"+ //end of col
        "<div class='col-md-6 col-xs-12'>" +
          "<ul class='list-unstyled'>" +
            "<li><p class='text-left'><small>가입 요청 리스트 </small><hr/></p></li>" +
            "<li><p class='text-left'><small>초대 대기 리스트 </small><hr/></p></li>" +
          "</ul>" +
        "</div>" +
      "</div>" +
    "</div>";

   modalEl.html(text);
   $('#myPageAtGroup_modal').modal('show');

//    $("#modal").html(thisPageCache.group.smallgroups[smallgroupIndex].members[memberIndex].modal_contents);
//           if(is_enable_request_btn){
//             $("#send_span").html(" <span class=\"glyphicon glyphicon-send\" id=\"send_btn\"  onclick=\"send_request_to_tree_of_the_group('"+this.data("email")+"','"+this.data("g_email")+"','"+this.data("g_name")+"')\"></span>");
//            
//           }
//       $('#myPageAtGroup_modal').modal('show');

}


function openGroupManagePage() {
//  var group = thisPageCache.group;
//  var myMember = thisPageCache.myMember;
//  var joinRequestMembers = group.join_request_members;
//  var text = 
//  "<div class='modal fade'  id='groupInfoPageModal'  tabindex='-1' role='dialog' aria-labelledby='myModalLabel' aria-hidden='true'> " +
//    "<span class='btn btn-sm' id='close_btn' data-dismiss='modal' aria-hidden='true'>×</span> " +
//    "<div id='profile_contents' class='row'> " ;
//  if (myMember.m_is_g_master_manager==1) {
//    text +=
//      "<div class='col-md-6 col-xs-12'>" +
//        "<img id='group-image' class='img-circle size-70' src='"+ group.g_thumbnail +"'/>" +
//        "<p class='text-right'><i class='fa fa-users'></i> : " + group.g_count+"</p>"+
//        "<form class='form-makeGroup' action='/group/"+ group.g_id+ "' onsubmit='return validateGroupForm()' method='post' enctype='multipart/form-data'>" +
//          "<div class='form-group'>" +
//            "<p class='text-left'><small>Select Group Cover Image file</small></p>" +
//            "<input type='file' id='group-image-file' name='pict' class='form-control'  onchange='readURL(this);'>" +
//          "</div>" +
//          "<div class='form-group'>" +
//            "<small><p class='text-left'>Group Name</p></small>" +
//            "<input type='text' id='group-name' name='g_name' class='form-control' value='"+group.g_name+"'>" +
//          "</div>" +
//          "<div class='form-group'>" +
//            "<p class='text-left'><small>Group Description</small></p>" +
//            "<input type='text' id='group-description' name='g_intro' class='form-control' value='"+group.g_intro+"'>" +
//          "</div>" +
//          "<button type='submit' class='btn btn-warning pull-right'><span class='fa fa-upload'></span> 그룹 수정 </button>" +
//          "<a class='btn btn-danger pull-right' href=''>삭제 </a>" +
//        "</form>" +
//      "</div><br/>" +
//      "<div class='col-md-6 col-xs-12'>" +
//        "<ul class='list-unstyled'>" +
//          "<br/><li><h4><p class='text-left'>그룹 가입 요청 멤버 리스트</p></h4><hr/></li>";
//    for (var i=0, len=joinRequestMembers.length; i<len; i++) {
//      text+=
//          "<li class='row'>"+
//            "<div class='col-xs-3 col-md-2 '>"+
//              "<img src='"+joinRequestMembers[i].u_thumbnail+"' class='img-responsive img-circle'>"+
//            "</div>"+
//            "<div class='col-xs-5 col-md-7 '>"+
//              "<h4>"+joinRequestMembers[i].u_name+"<small><p class='text-right'></p></small></h4>"+
//              "<small>"+joinRequestMembers[i].u_email+"</small>"+
//            "</div>" +
//            "<div class='col-xs-4 col-md-3 '>" +
//              "<a class='btn btn-danger pull-right' href=''>거절</a> " +
//              "<a class='btn btn-success pull-right' href=''>수락</a> " +
//            "</div>" +
//          "</li>";
//    }
//    text+=
//          "<br/><li><h4><p class='text-left'>그룹 초대 멤버 리스트</p></h4><hr/></li>" +
//        "</ul>" +
//      "</div>" ;
//  } else {
//    text +=
//      "<img id='group-image' class='img-circle size-70 ' src='"+ group.g_thumbnail +"'/> "+ group.g_name +
//      "<br/><small><i class='fa fa-users'></i> : " + group.g_count +" </small>";
//    
//    if(group.g_intro) {
//      text+=      
//        "<br/><small><i class='fa fa-comment'></i> : \" "+group.g_intro+" \"</small>";
//    }
//  }
//  text+="</div>" + "</div>";
//  
//  modalEl.html(text);
//  $('#groupInfoPageModal').modal('show');
}

function validateMakeSmallGrouprPage() {
  var sg_id = $('input:radio[name="sg_id"]:checked').val();
  var sg_depth = $("#sg_depth"+sg_id).val(); 
  alert(sg_depth);
  if(!sg_id) {
    alert("소그룹을 선택해 주세요!");
    return false;
  }
  
  if (!$("#small-group-name").val()) {
    alert("enter your name of small group");
    return false;
  } 

  if (!$("#small-group-description").val()) {
    alert("enter your description of small group");
    return false;
  } 
  
  $("#sg_depth").val(sg_depth);
  alert($("#sg_depth").val());
  
  return true;
}


function openMakeSmallGrouprPage() {
  var group = thisPageCache.group;
  var smallgroups = group.smallgroups;
  var myMember = thisPageCache.myMember;
  var htmlText = 
    "<div class='modal fade'  id='makeakeSmallGrouprPageModal'  tabindex='-1' role='dialog' aria-labelledby='myModalLabel' aria-hidden='true'> " +
      "<span class='btn btn-sm' id='close_btn' data-dismiss='modal' aria-hidden='true'>×</span> " +
      "<div id='profile_contents' class='row'> " +
        "<form action='/smallgroup?g_id="+ group.g_id+ "' onsubmit='return validateMakeSmallGrouprPage()' method='post' enctype='multipart/form-data'>" +
          "<input type='hidden' id='sg_depth' name='sg_depth'>" +
          "<input type='hidden' name='g_id' value='"+group.g_id+"'>" +
          "<div class='col-md-6 col-xs-12'>" +
            "<ul class='list-unstyled'>" +
              "<li><h4><p class='text-left'>부모 소그룹을 선택하세요!</p></h4><hr/></li>" ;
  
    for (var i=0, len=smallgroups.length; i<len; i++) {
      htmlText+=
              "<li class='row'>"+
                "<div class='col-xs-3 col-md-2 '>"+
                  "<img src='"+smallgroups[i].sg_thumbnail+"' class='img-responsive  size-60'>"+
                "</div>"+
                "<div class='col-xs-5 col-md-7 '>"+
                  "<h4>"+smallgroups[i].sg_name+"<small><p class='text-right'></p></small></h4>"+
                  "<small>"+smallgroups[i].sg_intro+"</small>"+
                "</div>" +
                "<div class='col-xs-4 col-md-3 '>" +
                  "<input type='hidden' id='sg_depth"+smallgroups[i].sg_id+"' value='"+smallgroups[i].sg_depth+"'>" +
                  "<input type='radio' name='sg_id' value='"+smallgroups[i].sg_id+"' required>" +
                "</div>" +
              "</li>";
    }

    htmlText+=
              
            "</ul>" +
          "</div>" +
          "<div class='col-md-6 col-xs-12'>" +
            "<img id='small-group-image' class='img-responsive img-thumbnail size-70' src='/img/tree-128x128.png'>"+
            "<div class='form-group'>" +
              "<h4>Select Small Group Cover Image file</h4>" +
              "<input type='file' id='small-group-image-file' name='pict' class='form-control'  onchange='readURL(this);'>" +
            "</div>" +
            "<div class='form-group'>" +
              "<h4>Small Group Name</h4>" +
              "<input type='text' id='small-group-name' name='sg_name' class='form-control' required>" +
            "</div>" +
            "<div class='form-group'>" +
              "<h4>Small Group Description</h4>" +
              "<input type='text' id='small-group-description' name='sg_intro' class='form-control' required>" +
            "</div>" +
            "<button type='submit' class='btn btn-primary pull-right'><span class='fa fa-upload'></span> + 소그룹 생성하기 </button>" +
          "</div>";
   
    htmlText+="</form>"+"</div>" + "</div>";
    
    modalEl.html(htmlText);
    $('#makeakeSmallGrouprPageModal').modal('show');
    
}
function validateAcceptJoinRequestMemberPage () {
  var sg_id = $('input:radio[name="sg_id"]:checked').val();
  if(!sg_id) {
    alert("소그룹을 선택해 주세요!");
    return false;
  }
  return true;
}

function openAcceptJoinRequestMemberPage (joinRequestMemberIndex) {
  var group = thisPageCache.group;
  var smallgroups = group.smallgroups;
  var myMember = thisPageCache.myMember;
  var joinRequestMember = group.join_request_members[joinRequestMemberIndex];
  var htmlText = 
    "<div class='modal fade'  id='acceptJoinRequestMemberPageModal'  tabindex='-1' role='dialog' aria-labelledby='myModalLabel' aria-hidden='true'> " +
      "<span class='btn btn-sm' id='close_btn' data-dismiss='modal' aria-hidden='true'>×</span> " +
      "<div id='profile_contents' class='row'> " +
        "<div class='col-md-6 col-xs-12'>" +
          "<ul class='list-unstyled'>" +
            "<form action='/member/"+ joinRequestMember.m_id+ "/accept' onsubmit='return validateAcceptJoinRequestMemberPage()' method='post' >" +
              "<li><h4><p class='text-left'>"+joinRequestMember.u_name+"가 소속될 소그룹을 선택하세요!</p></h4><hr/></li>" +
                "<input type='hidden' name='g_id' value='"+group.g_id+"'>";
  
    for (var i=0, len=smallgroups.length; i<len; i++) {
      htmlText+=
              "<li class='row'>"+
                "<div class='col-xs-3 col-md-2 '>"+
                  "<img src='"+smallgroups[i].sg_thumbnail+"' class='img-responsive  size-60'>"+
                "</div>"+
                "<div class='col-xs-5 col-md-7 '>"+
                  "<h4>"+smallgroups[i].sg_name+"<small><p class='text-right'></p></small></h4>"+
                  "<small>"+smallgroups[i].sg_intro+"</small>"+
                "</div>" +
                "<div class='col-xs-4 col-md-3 '>" +
                  "<input type='radio' name='sg_id' value='"+smallgroups[i].sg_id+"' aria-label='...'>" +
                "</div>" +
              "</li>";
    }

    htmlText+=
              "<button type='submit' class='btn btn-warning pull-right'><span class='fa fa-upload'></span> 가입 수락 </button>" +
            "</form>"+
          "</ul>" +
        "</div>" ;
   
    htmlText+="</div>" + "</div>";
    
    modalEl.html(htmlText);
    $('#acceptJoinRequestMemberPageModal').modal('show');
}

var drawGroupManage = function () {
  var group = thisPageCache.group;
  var smallgroups = group.smallgroups;
  var myMember = thisPageCache.myMember;
  var joinRequestMembers = group.join_request_members;
  var htmlText;
  if (myMember.m_is_g_manager == 1) {
    htmlText+=
      "<div class='row'>" +
        "<div class='col-md-12 col-xs-12'>" +
          "<br/><br/><h4><img id='group-image' class='img-circle size-70 ' src='"+ group.g_thumbnail +"'/> "+group.g_name+"</h4><hr/>" +
        "</div>" +
      "</div>" +
      "<div class='row'>" +
        "<div class='col-md-6 col-xs-12'>" +
          "<br/><h4>" +
            "<p class='text-left'>소그룹 리스트</p>" +
            "<a class='btn btn-primary pull-right' onclick='openMakeSmallGrouprPage()'>+ 소그룹 생성 </a></h4>" +
          "<hr/>"+
          "<ul class='list-unstyled'>";
    for (var i=0, len=smallgroups.length; i<len; i++) {
      htmlText+=
            "<li class='row'>"+
              "<div class='col-xs-3 col-md-2 '>"+
                "<img src='"+smallgroups[i].sg_thumbnail+"' class='img-responsive  size-60'>"+
              "</div>"+
              "<div class='col-xs-5 col-md-7 '>"+
                "<h4>"+smallgroups[i].sg_name+"<small><p class='text-right'></p></small></h4>"+
                "<small>"+smallgroups[i].sg_intro+"</small>"+
              "</div>" +
              "<div class='col-xs-4 col-md-3 '>" +
                "<a class='btn btn-danger pull-right' href=''>삭제</a> " +
                "<a class='btn btn-warning pull-right' href=''>수정</a> " +
                
              "</div>" +
            "</li>";
    }
    htmlText+=
          "</ul>" +
        "</div>" +
        "<div class='col-md-6 col-xs-12'>" +
          "<br/><h4><p class='text-left'>그룹 가입 요청 멤버 리스트</p></h4><hr/>"+
          "<ul class='list-unstyled'>" ;
      
    
    if (joinRequestMembers) {
      for (var i=0, len=joinRequestMembers.length; i<len; i++) {
        htmlText+=
              "<li class='row'>"+
                "<div class='col-xs-3 col-md-2 '>"+
                  "<img src='"+joinRequestMembers[i].u_thumbnail+"' class='img-responsive img-circle size-60'>"+
                "</div>"+
                "<div class='col-xs-5 col-md-7 '>"+
                  "<h4>"+joinRequestMembers[i].u_name+"<small><p class='text-right'></p></small></h4>"+
                  "<small>"+joinRequestMembers[i].u_email+"</small>"+
                "</div>" +
                "<div class='col-xs-4 col-md-3 '>" +
                  "<a class='btn btn-danger pull-right' href='/member/"+joinRequestMembers[i].m_id+"/refuse?g_id="+group.g_id+"'>거절</a> " +
                  "<a class='btn btn-success pull-right' onclick='openAcceptJoinRequestMemberPage("+i+")'>수락</a> " +
                "</div>" +
              "</li>";
      }
    }
    
    htmlText+=
            "<br/><br/><li><h4><p class='text-left'>그룹 초대 멤버 리스트</p></h4><hr/></li>" +
          "</ul>" +
        "</div>" +
      "</div>" ;
      
  }
  if (myMember.m_is_sg_manager == 1 ) {
    
  }

  contentEl.append(htmlText);
}

/* Group object의 메소드  */
var buildingTreeSmallgroup = function() {
  var smallgroups = this.smallgroups;
  var smallgroupslength = smallgroups.length;
  for (var index=0; index<smallgroupslength; index++) {
    var smallgroupNode = new SmallgroupNode(smallgroups[index]);
    smallgroupNode.setMembersNodes();
    
    //set x position 
    var groupDepth = smallgroups[smallgroupslength-1].sg_depth;
    var x = (dw_common.screenWidth)/(groupDepth+1);
    x = (x>100)?100:x;
    smallgroupNode.x= x*smallgroupNode.sg_depth ;

    if(!smallgroupNode.sg_thumbnail){
      smallgroupNode.sg_thumbnail = "/img/sg_img.jpg";
    }
    
    this.smallgroups[index] = smallgroupNode;
  }

  for (var i=0; i<smallgroupslength-1;  i++) {
    //set next sibling
    if (smallgroups[i].sg_depth === smallgroups[i+1].sg_depth) {  
      smallgroups[i].nextSiblingNode = smallgroups[i+1];
    }                                                

    //set first child
    for (var j=i+1; j<smallgroupslength; j++) {
      if (smallgroups[i].sg_id === smallgroups[j].sg_parent_sg_id) {
        smallgroups[i].firstChildNode = smallgroups[j]; 
        break;
      }
    }  
    
  }

  return smallgroups;
};



/* Group object */
function Group(group) {
  this.g_id = group.g_id; 
  this.g_name = group.g_name; 
  this.g_thumbnail = group.g_thumbnail; 
  this.g_intro = group.g_intro; 
  this.g_count = group.g_count; 
  this.join_request_members = group.join_request_members;
  
  this.smallgroups = group.smallgroups;
  
  this.buildingTreeSmallgroup = buildingTreeSmallgroup; 
  this.drawGroupManage = drawGroupManage;
  // this.draw;
}


/* Smallgroup Object */
function SmallgroupNode(smallgroup){
  //data of database
  this.sg_id = smallgroup.sg_id;
  this.sg_name = smallgroup.sg_name;
  this.sg_intro = smallgroup.sg_intro;
  this.sg_thumbnail = smallgroup.sg_thumbnail;
  this.sg_depth = smallgroup.sg_depth;
  this.sg_parent_sg_id = smallgroup.sg_parent_sg_id;
  this.sg_first_child_sg_id = smallgroup.sg_first_child_sg_id;
  this.sg_next_sibling_sg_id = smallgroup.sg_next_sibling_sg_id;
  this.members = smallgroup.members; 
  
  this.x;
  this.y;
  this.thumbImg;
//  this.leaderNode;// = new MemberNode(smallgroup);
  this.firstChildNode;
  this.nextSiblingNode;
  // this.membersNodes;
  
  this.setMembersNodes = function(){
    for (var index=0, len=this.members.length; index<len; index++) {
      this.members[index] = new MemberNode(this.members[index]);
      var member = this.members[index];
      var text = "<div class=\'modal fade\'  id=\'profile_modal\'  tabindex=\'-1\' role=\'dialog\' aria-labelledby=\'myModalLabel\' aria-hidden=\'true\'>" +
                "<span class=\'btn btn-sm\' id=\'close_btn\' data-dismiss=\'modal\' aria-hidden=\'true\'>×</span>" +
                "<div id=\'profile_contents\' >" +
                "<center>" +
                  "<img class=\'img-circle size-120 \' src=\'"+member.u_thumbnail+"\'/> " + member.u_name+"<span id=\'send_span\'></span>" +
                  "<small><br/><i class='fa fa-user'></i> : "+member.m_pos_name+"</small>";
          
      if(member.m_intro) {
        text+="<small><br/><i class='fa fa-comment'></i> : \" "+member.m_intro+" \"</small>";
      }
      
      
      text+="<small><br/> <span class='glyphicon glyphicon-envelope'></span> : "+member.u_email+"</small>";
      
      if(member.u_hp){
        text+="<small><br/><i class='fa fa-phone'></i> : "+member.u_hp+"</small>";
      }
      if(member.u_birth){
        text+="<small><br/><i class='fa fa-birthday-cake'></i> : "+member.u_birth+"</small>";
      }
      if(member.u_fb_link){
        text+="<small><br/><span class=\'glyphicon glyphicon-link\'></span> <a href=\'"+member.u_fb_link+"\'>facebook</a></small>";
      }
      text +="</center></div></div>";

      member.modal_contents = text;
    }
  };
    
}

/* Member Object */
function MemberNode(member){
  //data of database
  this.m_id = member.m_id;
  this.m_pos_name = member.m_pos_name;
  this.m_intro = member.m_intro;
  this.m_is_sg_manager = member.m_is_sg_manager;
  this.m_is_g_manager = member.m_is_g_manager;
  this.m_is_g_master_manager = member.m_is_g_master_manager;
  
  this.u_id = member.u_id;
  this.u_thumbnail = member.u_thumbnail;
  this.u_name = member.u_name;
  this.u_email = member.u_email;
  this.u_hp = member.u_hp;    //ms_is_hp_open
  this.u_birth = member.u_birth;  //ms_is_birth_open
  this.u_fb_link = member.u_fb_link;  //ms_is_fblink_open 에 따라서
  

  this.modal_contents;
  this.x;
  this.y;
}


/* small group 정보 수정할 때 씌임. */
function validateSmallGroupForm() {
  if (!$("#group-name").val()) {
    alert("enter your name of small group");
    return false;
  } else if (!$("#group-description").val()) {
    alert("enter your description of small group");
    return false;
  } 
  return true;
}

/* small group 정보 수정할 때, 사진 수정할 때 씌임. */
function readURL(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.onload = function (e) {
      $('#small-group-image').attr('src', e.target.result);
    }
    reader.readAsDataURL(input.files[0]);
  }
}




  