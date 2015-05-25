/**
 * New node file
 */
var setGroupListHTML = function (data_group_list, data_joining_group_list) {
  var grouplistElem = $('#group_list');

  var addedHTML = "<br/><li><h4>Groups</h4><hr/></li>";
  for(var i=0, len=data_group_list.length; i<len; i++) {
    addedHTML += '<li class="row">'+
                      '<a href="/group/'+data_group_list[i].g_id+'">' +
                        '<div class="col-xs-4 col-md-3 ">'+
                          '<img src="'+data_group_list[i].g_thumbnail+'" class="img-responsive size-120">'+
                        '</div>'+
                        '<div class="col-xs-8 col-md-9 ">'+
                          '<h3>'+data_group_list[i].g_name+'<small><p class="text-right"><i class="fa fa-users"></i> '+data_group_list[i].g_count+'</p></small></h3>'+
                          '<small>'+data_group_list[i].g_intro+'</small>'+
                        '</div>'+
                      '</a>'+
                    '</li>';
    
  }
  
  addedHTML += "<br/><br/><br/><li><h4>가입 요청 중인 Groups</h4><hr/></li>";
  
  for(var i=0, len=data_joining_group_list.length; i<len; i++) {
    addedHTML += '<li class="row">'+
                        '<div class="col-xs-4 col-md-3 ">'+
                          '<img src="'+data_joining_group_list[i].g_thumbnail+'" class="img-responsive size-120">'+
                        '</div>'+
                        '<div class="col-xs-8 col-md-9 ">'+
                          '<h3>'+data_joining_group_list[i].g_name+'<small><p class="text-right"><i class="fa fa-users"></i> '+data_joining_group_list[i].g_count+'</p></small></h3>'+
                          '<small>'+data_joining_group_list[i].g_intro+'</small>'+
                        '</div>'+
                    '</li>';
  }
  
  grouplistElem.append(addedHTML);
}


$( document ).ready(function () {
  var data_group_list = JSON.parse($('#data_group_list').val());
  var data_joining_group_list = JSON.parse($('#data_joining_group_list').val());
  
  if ($('#my_u_id').val() ==  $('#u_id').val()) {
    $('#profile-section').append('<a class="btn btn-default" href="/profile/form/edit/view">Edit</a>');
  }
  setGroupListHTML(data_group_list, data_joining_group_list);
//  var groupListElem = $('#group_list');
//  for (var i=0, len=data_group_list.length; i<len; i++) {
//    var addedHTML = '<li class="row">'+
//                      '<div class="col-xs-4 col-md-2 ">'+
//                        '<img src="'+data_group_list[i].g_thumbnail+'" class="img-responsive">'+
//                      '</div>'+
//                      '<div class="col-xs-8 col-md-10 ">'+
//                        '<h3>'+data_group_list[i].g_name+'<small><p class="text-right"><i class="fa fa-users"></i> '+data_group_list[i].g_count+'</p></small></h3>'+
//                        '<small>'+data_group_list[i].g_intro+'</small>'+
//                      '</div>'+
//                    '</li>';
//    groupListElem.append(addedHTML);
//  }
  
});
