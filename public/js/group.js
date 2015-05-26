$( document ).ready(function () {
  var data_group = JSON.parse($('#data_group').val());
  var group = new Group(data_group);
  

  group.buildingTreeSmallgroup();
  group.drawSmallgroups();
  thisPageCache.group = group;
  
  var my_u_id = $('#my_u_id').val();
  var smallgroups = group.smallgroups;
  for (var i=0, lengthOfSmallgroups = smallgroups.length; i<lengthOfSmallgroups; i++) {
    for (var j=0, lengthOfMembers=smallgroups[i].members.length; j<lengthOfMembers; j++) {
      if( smallgroups[i].members[j].u_id == my_u_id) {
        thisPageCache.myMember = smallgroups[i].members[j];
        break;
      }
    }
  }
  group.drawGroup();
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
          m_is_sg_manager:,
          m_is_g_manager:,
          m_is_g_master_manager:,
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


//전역 객체. 
var dw_common = {
  screenHeight : (window.innerHeight || self.innerHeight || document.documentElement.clientHeight || document.body.clientHeight),
  screenWidth : (window.innerWidth || self.innerWidth || document.documentElement.clientWidth || document.body.clientWidth),
  topNavigationBarHeight: 50,
  thumbnailSize50 : 50, 
  thumbnailSize60 : 60,
};

var bodyEl = document.body;
var closebtn = document.getElementById( 'close-button' );
var content = document.querySelector( '.content-wrap' );
var isOpen = false;
var holder = document.querySelector( '#holder' );
var modalEl = $("#modal");

var thisPageCache={};
var  r = Raphael("holder", dw_common.screenWidth, dw_common.screenHeight-dw_common.topNavigationBarHeight);


/* closeMenu 이벤트. */
function closeMenu() {
  if (isOpen) {
    $('body').removeClass('show-menu');
    isOpen = false;  
  }
}


/* closeMenu 이벤트 등록. */
function initSideMenuEvent () {
  closebtn.addEventListener( 'click', closeMenu);
}


/* 멤버 thumbnail 클릭시 실행되는 이벤트. */
function memberProfile (sInd, mInd) {
  var smallgroupIndex = parseInt(sInd);
  var memberIndex = parseInt(mInd);
  modalEl.html(thisPageCache.group.smallgroups[smallgroupIndex].members[memberIndex].modal_contents);
  $('#profile_modal').modal('show');
}


/* drawSmallgroups 정의. */
var drawSmallgroups = function(){
  var smallgroups = this.smallgroups;
  var connections = [];

  /* 소스룹 썸네일 클릭시 동작하는 메소드. 사이드 메뉴를 오픈한다.  */
  var openSmallgroupMemberListMenu = function () {
    var iconList = $(".icon-list");
    var smallGroup = thisPageCache.group.smallgroups[this.smallgroupIndex];
    var iconListHTMLString=
      '<a><center><img src="'+smallGroup.sg_thumbnail+'" class="img-rounded size-50"/>'+
      '<span>'+smallGroup.sg_name+'</span>'+
      '<br/><h5>" '+smallGroup.sg_intro+' "</h5></center></a>'; 
    
    for (var memberIndex=0, len=this.members.length; memberIndex<len; memberIndex++) {
      var member = this.members[memberIndex];
      iconListHTMLString+= '<a onclick="memberProfile('+
                              this.smallgroupIndex +',' +
                              memberIndex+
                            ')" >'+
                              '<img src="'+member.u_thumbnail+'" alt="'+member.u_name+'" class="img-circle size-50"/><span>'+member.u_name+'</span> ';
      if (member.m_is_sg_manager==1) {
        iconListHTMLString+=  '<span class="glyphicon glyphicon-flag"></span></a>';
      } else {
        iconListHTMLString+= '</a>';
      }
    }// end of for 문.
    iconList.html(iconListHTMLString);
    $('body').addClass('show-menu');
    isOpen = true;  
  }

  // smallgroups for-loop
  for (var smallgroupIndex=0, len=smallgroups.length; smallgroupIndex<len; smallgroupIndex++) {
    var smallgroup = smallgroups[smallgroupIndex];
    var thumbImg = r.image( smallgroup.sg_thumbnail, 
                            smallgroup.x, 
                            smallgroup.y,
                            dw_common.thumbnailSize50,
                            dw_common.thumbnailSize50
                     ).attr({
                       "stroke": Raphael.getColor(),
                       "stroke-width": 0.1,
                       cursor: "move"
                     });
    
    var title = r.text(
                  smallgroup.x+dw_common.thumbnailSize50/2,
                  smallgroup.y+dw_common.thumbnailSize50 +10, 
                  smallgroup.sg_name
                ).attr({
                  "font-size" : 12
                });
    
    thumbImg.title = title;
    thumbImg.smallgroupIndex = smallgroupIndex;
    thumbImg.members = smallgroup.members;
    thumbImg.click(openSmallgroupMemberListMenu);
    thumbImg.touchend(openSmallgroupMemberListMenu);
    
    smallgroup.thumbImg = thumbImg;
  } // end of smallgroups for-loop

  // draw connections
  for(var i=0, len=smallgroups.length; i<len ; i++ ) {
    var fromNode=smallgroups[i];
    if (fromNode.firstChildNode) {
      connections[i] = r.connection(
          fromNode.thumbImg, 
          fromNode.firstChildNode.thumbImg,
          "#000",
          "#000");
      var siblingNode = fromNode.firstChildNode.nextSiblingNode;
      while (siblingNode) {
        connections[i] = r.connection(
            fromNode.thumbImg, 
            siblingNode.thumbImg,
            "#000",
            "#000");
        siblingNode = siblingNode.nextSiblingNode;
      }// end of while 문.
    }// end of if 문.
  }// end of for 문.
  
  initSideMenuEvent(); //side 메뉴 이벤트 등록
}// draw small groups 끝.


/* 그룹 정보 페이지를 오픈하는 함수. */
function openGroupInfoPage() {  
  var group = thisPageCache.group;
  var myMember = thisPageCache.myMember;
  var text = 
  "<div class='modal fade'  id='groupInfoPageModal'  tabindex='-1' role='dialog' aria-labelledby='myModalLabel' aria-hidden='true'> " +
    "<span class='btn btn-sm' id='close_btn' data-dismiss='modal' aria-hidden='true'>×</span> " +
    "<div id='profile_contents'> " ;
  if (myMember.m_is_g_master_manager==1) {
    text +=
      "<img id='group-image' class='img-circle size-70' src='"+ group.g_thumbnail +"'/>" +
      "<p class='text-right'><i class='fa fa-users'></i> : " + group.g_count+"</p>"+
      "<form class='form-makeGroup' action='/group/"+ group.g_id+ "' onsubmit='return validateGroupForm()' method='post' enctype='multipart/form-data'>" +
        "<div class='form-group'>" +
          "<p class='text-left'><small>Select Group Cover Image file</small></p>" +
          "<input type='file' id='group-image-file' name='pict' class='form-control'  onchange='readURL(this);'>" +
        "</div>" +
        "<div class='form-group'>" +
          "<small><p class='text-left'>Group Name</p></small>" +
          "<input type='text' id='group-name' name='g_name' class='form-control' value='"+group.g_name+"'>" +
        "</div>" +
        "<div class='form-group'>" +
          "<p class='text-left'><small>Group Description</small></p>" +
          "<input type='text' id='group-description' name='g_intro' class='form-control' value='"+group.g_intro+"'>" +
        "</div>" +
        "<button type='submit' class='btn btn-warning pull-right'><span class='fa fa-upload'></span> 그룹 수정 </button>" +
        "<a class='btn btn-danger pull-right' href=''>삭제 </a>" +
      "</form>";
  } else {
    text +=
      "<img id='group-image' class='img-circle size-70 ' src='"+ group.g_thumbnail +"'/> "+ group.g_name +
      "<br/><small><i class='fa fa-users'></i> : " + group.g_count +" </small>";
    
    if(group.g_intro) {
      text+=      
        "<br/><small><i class='fa fa-comment'></i> : \" "+group.g_intro+" \"</small>";
    }
  }
  
  text+="</div>" + "</div>";
  
  modalEl.html(text);
  $('#groupInfoPageModal').modal('show');
}


/* 사용자의 그룹 멤버 정보 페이지를 오픈하는 함수. */
function openMyMemberInfoPage() {
  var myMember = thisPageCache.myMember;
  var text = 
  "<div class='modal fade'  id='myMemberInfoPageModal'  tabindex='-1' role='dialog' aria-labelledby='myModalLabel' aria-hidden='true'> " +
    "<span class='btn btn-sm' id='close_btn' data-dismiss='modal' aria-hidden='true'>×</span> " +
    "<div id='profile_contents'> " +
      "<form class='form-update-member' action='/member/"+ myMember.m_id+ "?g_id="+thisPageCache.group.g_id+"' onsubmit='return validateMemberUpdateForm()' method='post'>" +
        "<img class='img-circle size-70 ' src='"+ myMember.u_thumbnail +"'/> "+ myMember.u_name ;
  if (myMember.m_pos_name) {
    text+="<br/><br/><input type='text' class='form-control' id='m_pos_name' name='m_pos_name' placeholder='멤버 직책/직무 ' value='"+myMember.m_pos_name+"'>"; 
  } else {
    text+="<br/><br/><input type='text' class='form-control' id='m_pos_name' name='m_pos_name' placeholder='멤버 직책/직무 '>";
  }
  if (myMember.m_intro) {
    text+="<br/><small><input type='text' class='form-control' id='m_intro' name='m_intro' placeholder='멤버 소개 멘트 ' value='"+myMember.m_intro+"'>";
  } else {
    text+="<br/><small><input type='text' class='form-control' id='m_intro' name='m_intro' placeholder='멤버 소개 멘트 '>";
  }
  if (myMember.u_hp) {
    text+="<br/><i class='fa fa-phone'></i> 전화번호 공개 : <input type='checkbox' id='m_is_hp_open' name='m_is_hp_open' value='1' aria-label='...' checked>" ;
  } else {
    text+="<br/><i class='fa fa-phone'></i> 전화번호 공개 : <input type='checkbox' id='m_is_hp_open' name='m_is_hp_open' value='1' aria-label='...'>" ;
  }
  if (myMember.u_birth) {
    text+="<br/><i class='fa fa-birthday-cake'></i> 생일 공개 : <input type='checkbox' id='m_is_birth_open'  name='m_is_birth_open' value='1' aria-label='...' checked>" ;
  } else {
    text+="<br/><i class='fa fa-birthday-cake'></i> 생일 공개 : <input type='checkbox' id='m_is_birth_open' name='m_is_birth_open' value='1' aria-label='...'>" ;
  }
  text+="<br/><button type='submit' class='btn btn-warning pull-right'><span class='fa fa-upload'></span> 멤버 정보 수정 </button>" +
        "<button class='btn btn-danger pull-right' onclick=''>그룹 탈퇴 </m_pos_name>" +
      "</form></div></div>";
  modalEl.html(text);
  $('#myMemberInfoPageModal').modal('show');
}


/* 화면 그리기. */
var drawGroup = function () {
  //그룹 이미지와 이름.
  r.text(100, 33, this.g_name).attr({
    "font-size" : 15
  });
  r.image( 
      this.g_thumbnail, 
      0, 
      25,
      dw_common.thumbnailSize50,
      dw_common.thumbnailSize50
  ).click(openGroupInfoPage).touchend(openGroupInfoPage);
  
  var myMember = thisPageCache.myMember;
  
  if (myMember.m_is_g_manager == 1) { // 유저가 현재 그룹의 그룹 매니저 라면.
    r.path("M21.053,20.8c-1.132-0.453-1.584-1.698-1.584-1.698s-0.51,0.282-0.51-0.51s0.51,0.51,1.02-2.548c0,0,1.414-0.397,1.132-3.68h-0.34c0,0,0.849-3.51,0-4.699c-0.85-1.189-1.189-1.981-3.058-2.548s-1.188-0.454-2.547-0.396c-1.359,0.057-2.492,0.792-2.492,1.188c0,0-0.849,0.057-1.188,0.397c-0.34,0.34-0.906,1.924-0.906,2.321s0.283,3.058,0.566,3.624l-0.337,0.113c-0.283,3.283,1.132,3.68,1.132,3.68c0.509,3.058,1.019,1.756,1.019,2.548s-0.51,0.51-0.51,0.51s-0.452,1.245-1.584,1.698c-1.132,0.452-7.416,2.886-7.927,3.396c-0.511,0.511-0.453,2.888-0.453,2.888h26.947c0,0,0.059-2.377-0.452-2.888C28.469,23.686,22.185,21.252,21.053,20.8zM8.583,20.628c-0.099-0.18-0.148-0.31-0.148-0.31s-0.432,0.239-0.432-0.432s0.432,0.432,0.864-2.159c0,0,1.199-0.336,0.959-3.119H9.538c0,0,0.143-0.591,0.237-1.334c-0.004-0.308,0.006-0.636,0.037-0.996l0.038-0.426c-0.021-0.492-0.107-0.939-0.312-1.226C8.818,9.619,8.53,8.947,6.947,8.467c-1.583-0.48-1.008-0.385-2.159-0.336C3.636,8.179,2.676,8.802,2.676,9.139c0,0-0.72,0.048-1.008,0.336c-0.271,0.271-0.705,1.462-0.757,1.885v0.281c0.047,0.653,0.258,2.449,0.469,2.872l-0.286,0.096c-0.239,2.783,0.959,3.119,0.959,3.119c0.432,2.591,0.864,1.488,0.864,2.159s-0.432,0.432-0.432,0.432s-0.383,1.057-1.343,1.439c-0.061,0.024-0.139,0.056-0.232,0.092v5.234h0.575c-0.029-1.278,0.077-2.927,0.746-3.594C2.587,23.135,3.754,22.551,8.583,20.628zM30.913,11.572c-0.04-0.378-0.127-0.715-0.292-0.946c-0.719-1.008-1.008-1.679-2.59-2.159c-1.584-0.48-1.008-0.385-2.16-0.336C24.72,8.179,23.76,8.802,23.76,9.139c0,0-0.719,0.048-1.008,0.336c-0.271,0.272-0.709,1.472-0.758,1.891h0.033l0.08,0.913c0.02,0.231,0.022,0.436,0.027,0.645c0.09,0.666,0.21,1.35,0.33,1.589l-0.286,0.096c-0.239,2.783,0.96,3.119,0.96,3.119c0.432,2.591,0.863,1.488,0.863,2.159s-0.432,0.432-0.432,0.432s-0.053,0.142-0.163,0.338c4.77,1.9,5.927,2.48,6.279,2.834c0.67,0.667,0.775,2.315,0.746,3.594h0.48v-5.306c-0.016-0.006-0.038-0.015-0.052-0.021c-0.959-0.383-1.343-1.439-1.343-1.439s-0.433,0.239-0.433-0.432s0.433,0.432,0.864-2.159c0,0,0.804-0.229,0.963-1.841v-1.227c-0.001-0.018-0.001-0.033-0.003-0.051h-0.289c0,0,0.215-0.89,0.292-1.861V11.572z"
    ).translate(
        dw_common.screenWidth-100,
        20
    ).attr({
      fill:"#000",
      strock:"none",
      href:"/group/"+thisPageCache.group.g_id+"/manage"
    });
  }
  
  if (myMember.m_is_sg_manager == 1) {
  }
  
  //그룹 내의 자신의 멤버 정보 페이지를 열기 위한 아이콘.
  r.path("M20.771,12.364c0,0,0.849-3.51,0-4.699c-0.85-1.189-1.189-1.981-3.058-2.548s-1.188-0.454-2.547-0.396c-1.359,0.057-2.492,0.792-2.492,1.188c0,0-0.849,0.057-1.188,0.397c-0.34,0.34-0.906,1.924-0.906,2.321s0.283,3.058,0.566,3.624l-0.337,0.113c-0.283,3.283,1.132,3.68,1.132,3.68c0.509,3.058,1.019,1.756,1.019,2.548s-0.51,0.51-0.51,0.51s-0.452,1.245-1.584,1.698c-1.132,0.452-7.416,2.886-7.927,3.396c-0.511,0.511-0.453,2.888-0.453,2.888h26.947c0,0,0.059-2.377-0.452-2.888c-0.512-0.511-6.796-2.944-7.928-3.396c-1.132-0.453-1.584-1.698-1.584-1.698s-0.51,0.282-0.51-0.51s0.51,0.51,1.02-2.548c0,0,1.414-0.397,1.132-3.68H20.771z"
    ).translate(
      dw_common.screenWidth-60,
      20
    ).attr({
      fill:"#000",
      strock:"none"
    }).click(openMyMemberInfoPage).touchend(openMyMemberInfoPage);
};


/* 소그룹 트리를 만드는 메소드.  */
var buildingTreeSmallgroup = function() {
  var smallgroups = this.smallgroups;
  var smallgroupslength = smallgroups.length;
  for (var index=0; index<smallgroupslength; index++) {
    var smallgroupNode = new SmallgroupNode(smallgroups[index]);
    smallgroupNode.setMembersNodes();
    
    //set y position 
    var groupDepth = smallgroups[smallgroupslength-1].sg_depth;
    smallgroupNode.y= (dw_common.screenHeight-dw_common.topNavigationBarHeight-30)/(groupDepth+1)*smallgroupNode.sg_depth + dw_common.topNavigationBarHeight*1.5;

    //set x position
    var sameDepthNodesCount=0;
    var currentNodeIndex=0;
    for (var i=0; i<smallgroupslength; i++) {
      if (smallgroupNode.sg_depth === smallgroups[i].sg_depth) {
        sameDepthNodesCount++;
        if (smallgroupNode.sg_id === smallgroups[i].sg_id) {
            currentNodeIndex = sameDepthNodesCount-1;
        }
      } else if(smallgroups[i].sg_depth>smallgroupNode.sg_depth) {
        break;
      }
    }
    smallgroupNode.x = dw_common.screenWidth/(sameDepthNodesCount)*(currentNodeIndex + 0.5)-dw_common.thumbnailSize60/2;
    
    if(!smallgroupNode.sg_thumbnail){
      smallgroupNode.sg_thumbnail = "/img/sg_img.jpg";
    }
    
    this.smallgroups[index] = smallgroupNode;
  }

  for (var i=0; i<smallgroupslength-1; i++) {
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



/* Group 객체. */
function Group(group) {
  this.g_id = group.g_id; 
  this.g_name = group.g_name; 
  this.g_thumbnail = group.g_thumbnail; 
  this.g_intro = group.g_intro; 
  this.g_count = group.g_count; 
  
  this.join_request_members = group.join_request_members;
  
  this.smallgroups = group.smallgroups;
  
  this.buildingTreeSmallgroup = buildingTreeSmallgroup; 
  this.drawSmallgroups = drawSmallgroups;
  this.drawGroup = drawGroup;
}


/* Smallgroup 객체. */
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
  this.firstChildNode;
  this.nextSiblingNode;
  
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


/* Member 객체. */
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


/* group 정보 수정할 때 씌임. */
function validateGroupForm() {
  if (!$("#group-name").val()) {
    alert("enter your name of group");
    return false;
  } else if (!$("#group-description").val()) {
    alert("enter your description of group");
    return false;
  } else if ($("#group-name").attr("class") === "form-control alert alert-danger") {
    alert("your group's name is already used");
    return false;
  }
  return true;
}

/* group 정보 수정할 때, 사진 수정할 때 씌임. */
function readURL(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.onload = function (e) {
      $('#group-image').attr('src', e.target.result);
    }
    reader.readAsDataURL(input.files[0]);
  }
}


/* group 정보 수정할 때 씌임. */
function checkGroupNameDuplication(){
  var g_name = $(this).val();
  var checkGroupNameURL = "/group/check/nameDuplication?g_name="+g_name;
 
  $.ajax({
    url : checkGroupNameURL,
    dataType : 'json',
    success : function (data) {
      if (data.is_ok) {
        return $('#group-name').removeClass("alert alert-danger").addClass("alert alert-success");
      } else {
        return $('#group-name').removeClass("alert alert-success").addClass("alert alert-danger");
      }
    }
  });

}
/* group 정보 수정할 때 씌임. */
$('#group-name').change(checkGroupNameDuplication);


/* member정보 수정할 때 씌임. */
function validateMemberUpdateForm () {
//  var ttt = $("#m_is_hp_open").val();
//  alert(ttt+":asdf");
  return true;
}

  