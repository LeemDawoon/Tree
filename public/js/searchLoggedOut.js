/**
 * New node file
 */
$( document ).ready(function () {
  var search_result = JSON.parse($('#search_result').val());
  var member_list = search_result.member_list;
  var group_list = search_result.group_list;
  var searchListElem = $('#search_list');
  
  searchListElem.append("<br/><li><h4>Groups</h4><hr/></li>");
  for (var i=0, len=group_list.length; i<len; i++) {
    var addedHTML = '<li class="row">'+
                      '<div class="col-xs-4 col-md-2 ">'+
                        '<img src="'+group_list[i].g_thumbnail+'" class="img-responsive">'+
                      '</div>'+
                      '<div class="col-xs-8 col-md-10 ">'+
                        '<h3>'+group_list[i].g_name+'<small><p class="text-right"><i class="fa fa-users"></i> '+group_list[i].g_count+'</p></small></h3>'+
                        '<small>'+group_list[i].g_intro+'</small>'+
                      '</div>'+
                    '</li>';
    searchListElem.append(addedHTML);
  }
  searchListElem.append("<br/><li><h4>Users</h4><hr/></li>");
  for (var i=0, len=member_list.length; i<len; i++) {
    var addedHTML = '<li class="row" >'+
                      "<a onclick='memberLink()'>"+
                        '<div class="col-xs-4 col-md-2 ">'+
                          '<img src="'+member_list[i].u_thumbnail+'" class="img-responsive img-circle">'+
                        '</div>'+
                        '<div class="col-xs-8 col-md-10 ">'+
                          '<h3>'+member_list[i].u_name+'<small><p class="text-right"></p></small></h3>'+
                          '<small>'+member_list[i].u_email+'</small>'+
                        '</div>'+
                      "</a>" +
                    '</li>';
    searchListElem.append(addedHTML);
  }
  
});


function memberLink(){
//  alert("");
}
