/**
 * New node file
 */
var setForestListHTML = function (data_group_list) {
  var grouplistElem = $('#group_list');

  for(var i=0, len=data_group_list.length; i<len; i++) {
//    var result ='<li class="list-item"><div class="container"><div class="row"><a href="/group/form/'+data_group_list[i].g_id+'"><div class="col-md-2"><div class="item-cover"><img class="tree-img img-responsive size-120" src="'+
//    data_group_list[i].g_thumbnail+'"></div></div><div class="col-md-10"><div class="item-header"><h4>'+ 
//             
//    data_group_list[i].g_name +'</h4><h5><span class="fa fa-users"></span>'+
//    data_group_list[i].g_count +'</h5></div><div class="item-body"><p>'+
//    data_group_list[i].g_intro +'</div><div class="item-footer"></div></div></a></div><hr></div></li> ';
//    
    var addedHTML = '<li class="row">'+
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
    
    grouplistElem.append(addedHTML);
  }
    
}


$( document ).ready(function () {
  var data_group_list = JSON.parse($('#data_group_list').val());

  if ($('#my_u_id').val() ==  $('#u_id').val()) {
    $('#profile-section').append('<a class="btn btn-default" href="/profile/form/edit/view">Edit</a>');
  }
  setForestListHTML(data_group_list);
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
