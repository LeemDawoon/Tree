$( document ).ready(function () {
  var data_group = JSON.parse($('#data_group').val());
  var group = new Group(data_group);

  
  $('#g_name').html(group.g_name+' <small><span class="fa fa-users">'+group.g_count+'</small> <span>');

  group.buildingTreeSmallgroup();
//  group.drawSmallgroups();
  thisPageCache.group = group;
  
  var my_u_id = $('#my_u_id').val();
  var smallgroups = group.smallgroups;
  
  for (var i=0, lengthOfSmallgroups = smallgroups.length; i<lengthOfSmallgroups; i++) {
    for (var j=0, lengthOfMembers=smallgroups[i].members.length; j<lengthOfMembers; j++) {
//      alert(j);
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




function validateMakeSmallGrouprPage() {
  var sg_id = $('input:radio[name="sg_id"]:checked').val();
  var sg_depth = $("#sg_depth"+sg_id).val(); 
  $("#sg_depth").val(sg_depth);
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
  
  
  return true;
}


function openMakeSmallGroupPage() {
  var group = thisPageCache.group;
  var smallgroups = group.smallgroups;
  var myMember = thisPageCache.myMember;
  var htmlText = 
    "<div class='modal fade'  id='makeSmallGrouprPageModal'  tabindex='-1' role='dialog' aria-labelledby='myModalLabel' aria-hidden='true'> " +
      "<span class='btn btn-sm' id='close_btn' data-dismiss='modal' aria-hidden='true'>×</span> " +
      "<div id='profile_contents' class='row'> " +
        "<form action='/smallgroup?g_id="+ group.g_id+ "' onsubmit='return validateMakeSmallGrouprPage()' method='post' enctype='multipart/form-data'>" +
          "<input type='hidden' id='sg_depth' name='sg_depth'>" +
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
    $('#makeSmallGrouprPageModal').modal('show');
}

function validateUpdateSmallGrouprPage() {
  var returnValue = confirm("소그룹 정보를 수정하시겠습니까? ");
  if (returnValue) {
    return true;
  } else {
    return false;
  }
}

function validateUpdateSmallGrouprPageForParent() {
  var returnValue = confirm("부모 소그룹 설정을 수정하시겠습니까? ");
  if (returnValue) {
    var sg_parent_sg_id = $('input:radio[name="sg_parent_sg_id"]:checked').val();
    var sg_depth = $("#sg_depth"+sg_parent_sg_id).val(); 
    $("#sg_depth").val(sg_depth);
    alert(sg_depth);
    return true;
  } else {
    return false;
  }
}
function openUpdateSmallGroupPage(index) {
  var group = thisPageCache.group;
  var smallgroups = group.smallgroups;
  var smallgroup = smallgroups[index];
  var members=smallgroup.members;
//  alert(members.length);
  
  var myMember = thisPageCache.myMember;
  var htmlText = 
    "<div class='modal fade'  id='openUpdateSmallGroupPageModal'  tabindex='-1' role='dialog' aria-labelledby='myModalLabel' aria-hidden='true'> " +
      "<span class='btn btn-sm' id='close_btn' data-dismiss='modal' aria-hidden='true'>×</span> " +
      "<div id='profile_contents' class='row'> " +
        "<input type='hidden' name='g_id' value='"+group.g_id+"'>" +
        "<div class='col-md-6 col-xs-12'>" +
          "<form action='/smallgroup/"+smallgroup.sg_id+"?g_id="+ group.g_id+ "' onsubmit='return validateUpdateSmallGrouprPage()' method='post' enctype='multipart/form-data'>"+ 
            "<img id='small-group-image' class='img-responsive img-thumbnail size-70' src='"+smallgroup.sg_thumbnail+"'>"+
            "<div class='form-group'>" +
              "<h4>Select Small Group Cover Image file</h4>" +
              "<input type='file' id='small-group-image-file' name='pict' class='form-control'  onchange='readURL(this);'>" +
            "</div>" +
            "<div class='form-group'>" +
              "<h4>Small Group Name</h4>" +
              "<input type='text' id='small-group-name' name='sg_name' class='form-control' value='"+smallgroup.sg_name+"' required>" +
            "</div>" +
            "<div class='form-group'>" +
              "<h4>Small Group Description</h4>" +
              "<input type='text' id='small-group-description' name='sg_intro' class='form-control' value='"+smallgroup.sg_intro+"' required>" +
            "</div>" +
            "<button type='submit' class='btn btn-primary pull-right'><span class='fa fa-upload'></span> + 소그룹 수정하기 </button>" +
            "<br/><br/><h4><p class='text-left'>소그룹 관리자 권한 부여</p></h4><hr/>" +
          "</form>" +
          "<ul class='list-unstyled'>" ;
      for (var i=0, len=members.length; i<len ; i++ ) {
        htmlText+=
            "<li class='row'>"+
              "<div class='col-xs-3 col-md-3 '>"+
                "<img src='"+members[i].u_thumbnail+"' class='img-responsive  size-60'>"+
              "</div>"+
              "<div class='col-xs-7 col-md-7 '>"+
                "<h4>"+members[i].u_name+"<small><p class='text-right'></p></small></h4>"+
                "<small>"+members[i].m_intro+"</small>"+
              "</div>" +
              "<div class='col-xs-2 col-md-2 '>";
        if (members[i].m_is_sg_manager==1) {
          htmlText +=
                "<input type='radio' name='m_is_sg_manager' value='"+members[i].m_id+"' checked required> " +
                "<p class='pull-right glyphicon glyphicon-flag'></p>";
          
        } else {
          htmlText += 
                "<input type='radio' name='m_is_sg_manager' value='"+members[i].m_id+"' required>" ;
        }
        htmlText +=          
              "</div>" +
            "</li>";
      }//end of for
      
      htmlText+=
          "</ul>" +
        "</div>" +
        "<div class='col-md-6 col-xs-12'>" +
        "<form action='/smallgroup/"+smallgroup.sg_id+"?g_id="+ group.g_id+ "' onsubmit='return validateUpdateSmallGrouprPageForParent()' method='post'>"+
          "<input type='hidden' id='sg_depth' name='sg_depth'>" +
          "<ul class='list-unstyled'>" +
            "<li><h4><p class='text-left'>부모 소그룹</p></h4><hr/></li>" ;
  
    for (var i=0, len=smallgroups.length; i<len; i++) {
      if(i==index) continue;  //자기 소그룹은 표시하지 않기.
      htmlText+=
            "<li class='row'>"+
              "<div class='col-xs-3 col-md-2 '>"+
                "<img src='"+smallgroups[i].sg_thumbnail+"' class='img-responsive  size-60'>"+
              "</div>"+
              "<div class='col-xs-7 col-md-7 '>"+
                "<h4>"+smallgroups[i].sg_name+"<small><p class='text-right'></p></small></h4>"+
                "<small>"+smallgroups[i].sg_intro+"</small>"+
              "</div>" +
              "<div class='col-xs-2 col-md-3 '>" +
                "<input type='hidden' id='sg_depth"+smallgroups[i].sg_id+"' value='"+smallgroups[i].sg_depth+"'>" ;
      if (smallgroup.sg_parent_sg_id==smallgroups[i].sg_id) {
        htmlText += 
                "<input type='radio' name='sg_parent_sg_id' value='"+smallgroups[i].sg_id+"' checked required>" ;
      } else {
        htmlText += 
                "<input type='radio' name='sg_parent_sg_id' value='"+smallgroups[i].sg_id+"' required>" ;
      }
      htmlText +=  
              "</div>" +
            "</li>";
    }

    htmlText+=
            "<br/><button type='submit' class='btn btn-primary pull-right'><span class='fa fa-upload'></span> + 부모 소그룹 설정 수정하기 </button>" +
          "</ul>" +
        "</form>" +
        "</div>" +
      "</div>" + 
    "</div>";
    
    modalEl.html(htmlText);
    $('#openUpdateSmallGroupPageModal').modal('show');
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
          "<br/><br/>" +
          "<a href='/group/"+group.g_id+"'>" +
            "<h4><img id='group-image' class='img-circle size-70 ' src='"+ group.g_thumbnail +"'/> "+group.g_name+"</h4><hr/>" +
      		"</a>" +
        "</div>" +
      "</div>" +
      "<div class='row'>" +
        "<div class='col-md-6 col-xs-12'>" +
          "<br/><h4>" +
            "<p class='text-left'>소그룹 리스트</p>" +
            "<a class='btn btn-primary pull-right' onclick='openMakeSmallGroupPage()'>+ 소그룹 생성 </a></h4>" +
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
                "<a class='btn btn-warning pull-right' onclick='openUpdateSmallGroupPage("+i+")'>수정</a> " +
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
//  this.sg_first_child_sg_id = smallgroup.sg_first_child_sg_id;
//  this.sg_next_sibling_sg_id = smallgroup.sg_next_sibling_sg_id;
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




  