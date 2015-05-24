/**
 * New node file
 */
$( document ).ready(function () {
  var data_group_list = JSON.parse($('#data_group_list').val());
  var data_group_list_count = $('#data_group_list_count').val();
  var groupListElem = $('#group_list');
  for (var i=0, len=data_group_list.length; i<len; i++) {
    var addedHTML = '<li class="row">'+
                      '<div class="col-xs-4 col-md-2 ">'+
                        '<img src="'+data_group_list[i].g_thumbnail+'" class="img-responsive">'+
                      '</div>'+
                      '<div class="col-xs-8 col-md-10 ">'+
                        '<h3>'+data_group_list[i].g_name+'<small><p class="text-right"><i class="fa fa-users"></i> '+data_group_list[i].g_count+'</p></small></h3>'+
                        '<small>'+data_group_list[i].g_intro+'</small>'+
                      '</div>'+
                    '</li>';
    groupListElem.append(addedHTML);
  }
  
});
