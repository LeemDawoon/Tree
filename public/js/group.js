var setGroupListHTML = function (groupsData) {
  var grouplistElem = $('#group-list');

  for(var i=0; i<groupsData.length; i++) {
    var result ='<li class="list-item"><div class="container"><div class="row"><div class="col-md-2"><div class="item-cover"><img class="tree-img img-responsive size-120" src="'+
             groupsData[i].g_thumbnail+'"></div></div><div class="col-md-10"><div class="item-header"><h4>'+ 
             // 'http://placehold.it/120x120'+'"></div></div><div class="col-md-10"><div class="item-header"><h4>'+ 
             
             groupsData[i].g_name +'</h4><h5><span class="fa fa-users"></span>'+
             groupsData[i].g_count +'</h5></div><div class="item-body"><p>'+
             groupsData[i].g_intro +'</div><div class="item-footer"></div></div></div><hr></div></li> ';

    grouplistElem.append(result);
  }
};



// load profile data
//function loadGroupDetailData() {
//  var g_id = $('#g_id').val();
//  var getGroupDetailDataUrl = '/group/'+g_id;
//
//  $.ajax({
//      url : getGroupDetailDataUrl,
//      dataType : 'json',
//      // jsonp : "callback",
//      success : function (data) {
//
//
//          // graffieTest();
//        var group = new Group(data);
//        
//        $('#g_name').html(group.g_name+' <small><span class="fa fa-users">'+group.g_count+'</small> <span>');
//
//        group.buildingTreeSmallgroup();
//        group.drawSmallgroups();
//        thisPageCache.group = group;
//
//        group.drawGroup();
//      }
//  });
//  // return false
//};

//window.onload=loadGroupDetailData();

$( document ).ready(function () {
  var data_group = JSON.parse($('#data_group').val());
  var group = new Group(data_group);

  
  $('#g_name').html(group.g_name+' <small><span class="fa fa-users">'+group.g_count+'</small> <span>');

  group.buildingTreeSmallgroup();
  group.drawSmallgroups();
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
  group.drawGroup();
});
