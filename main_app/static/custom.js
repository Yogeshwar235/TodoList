(function(){
  $(window).scroll(function () {
      var top = $(document).scrollTop();
      $('.splash').css({
        'background-position': '0px -'+(top/3).toFixed(2)+'px'
      });
      if(top > 50)
        $('#home > .navbar').removeClass('navbar-transparent');
      else
        $('#home > .navbar').addClass('navbar-transparent');
  });

  $("a[href='#']").click(function(e) {
    e.preventDefault();
  });

  $('body [data-toggle="popover"]').popover();
  $('body [data-toggle="tooltip"]').tooltip();
  $('body').on("click", ".list-group-item [data-toggle='popover']", function(){
    $(this).popover({ 
       placement : 'right',
       container : 'body',
       html : true,
    content: function() {
       return $('#popover-content').html();
        }

    }).click(function(e){
    e.preventDefault();
    })
});

//for close other popover when one popover button click
$('body').on("click", '[data-toggle="popover"]' , function(){

        $('[data-toggle="popover"]').not(this).popover('hide');
 });
})();

$('document').ready(function() {
    $('#datePicker')
      .datepicker({
          autoclose: true,
          format: 'yyyy-mm-dd'
      });
});

lists_store = {}
$('document').ready(load_lists());
function load_lists(){
  $.get("api/lists/?format=json",function(lists){
    $(".list-group.table-of-contents.nav.nav-tabs").html("")
    _lists = []
    $.each(lists,function(key, list){
      lists_store[list.id] = list
      _lists.push('<a class="list-group-item" href="#list-'+list.id+'" data-toggle="tab" id ="'+list.id+'">'+list.name+'</a>')
    });
    if(Object.keys(lists_store).length==0){
      $(".list-group.table-of-contents.nav.nav-tabs").html("<div class='panel panel-primary'><div class='panel-heading'><h3 class='panel-title'>No lists yet...</h3></div></div><div class='col-lg-2'><button type='button' class='btn btn-info' id='create_list_form'>Add List</button></div>")
    }else{
      $(".list-group.table-of-contents.nav.nav-tabs").html(_lists.join("\n"));
      if($('#create_list_form').length==0){
        $(".list-group.table-of-contents.nav.nav-tabs").after('<br/><button type="button" class="btn btn-info col-lg-12" id="create_list_form">Add List</button>');
      }
      load_items(lists_store)
    }
  });
}
function load_items(lists_store){
  var active_list_set = $(".tab-pane.fade.active.in")
  $('#myitemset').html("");
  $.each(lists_store,function(id,list){
      $('<div/>',{
        class: "tab-pane fade",
        id: "list-"+list.id,
        html: ""
      }).appendTo('#myitemset');

      $("#list-"+list.id+".tab-pane.fade").append("<blockquote><p>"+list.description+"</p><small>Creation date: <cite>"+list.creation_date+"</cite></small></blockquote>");
      if(list['items'].length==0){
        $("#list-"+list.id+".tab-pane.fade").append("<div class='panel panel-primary'><div class='panel-heading'><h3 class='panel-title'>List is Empty</h3></div></div><div class='col-lg-2'><button type='button' class='btn btn-info' id='create_item_form'>Add Item</button></div>");
      }else{
        _items = []
        $.each(list['items'],function(key,item){
          _items.push('<a class="list-group-item" id ="'+item.id+'">'+item.name+'</a>');
        });
        _items = $('<div/>',{
          class: "list-group table-of-contents",
          html: _items.join("\n"),
        });
        $("#list-"+list.id+".tab-pane.fade").append(_items);
        $("#list-"+list.id+".tab-pane.fade").append("<div class='col-lg-2'><button type='button' class='btn btn-info' id='create_item_form'>Add Item</button></div>");
        }
    });
  if(active_list_set.length==1){//important to maintain state after update delete operations on items
    id = active_list_set[0].id.split('-')[1]
    $('#list-'+id).addClass("active in")
  }
}
$('body').on('click','#myitemset > .tab-pane.fade.active.in > .list-group.table-of-contents > .list-group-item',(item)=>{
    console.log(item.target.id);
    parent_id = $(".tab-pane.fade.active.in").prop('id').split('-')[1]
    $.get("api/lists/"+parent_id+"/items/"+item.target.id+"?format=json",function(item){
      $("#id_col > div > input").val(item.id)
      $("#name_col > div > input").val(item.name);
      $("#desc_col > div > textarea").val(item.description);
      $("#check_col > div > input").prop('checked', item.completed);
      $("#date_col > div > div > input").val(item.due_date);

      $("#check_col").show()
      $("legend").html("Item")
      $("#date_col > label").html("Due date")
      $(".modal-footer").html("")
      $(".modal-footer").append('<button type="button" class="btn btn-danger col-lg-2" id="delete_item">Delete</button>')
      $(".modal-footer").append('<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>')
      $(".modal-footer").append('<button type="button" class="btn btn-primary" id="update_item">Update</button>')
      $("#item-modal").modal();
      });
});

$('body').on('click','#create_list_form',(item)=>{
    $("#check_col").hide()
    $("legend").html("List")
    $("#date_col > label").html("Created Date")
    $("#name_col > div > input").val("");
    $("#desc_col > div > textarea").val("");
    $("#check_col > div > input").prop('checked', false);
    $("#date_col > div > div > input").val("");
    $(".modal-footer").html("")
    $(".modal-footer").append('<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>')
    $(".modal-footer").append('<button type="button" class="btn btn-primary" id="create_list">Create</button>')
    $("#item-modal").modal();
});

$('body').on('click','#create_item',(item)=>{
    parent_id = $(".tab-pane.fade.active.in").prop('id').split('-')[1]
    name = $("#name_col > div > input").val()
    description = $("#desc_col > div > textarea").val()
    completed = $("#check_col > div > input").prop('checked')
    due_date = $("#date_col > div > div > input").val()
    item = {'name':name,'description':description,'completed':completed,'due_date':due_date}
    $.ajax("api/lists/"+parent_id+"/items/",{
        type: "POST",
        data: item,
        success: function(result){
            load_lists()
            $(".modal-footer").html("")
            $(".modal-footer").append('<button type="button" class="btn btn-danger col-lg-2" id="delete_item">Delete</button>')
            $(".modal-footer").append('<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>')
            $(".modal-footer").append('<button type="button" class="btn btn-primary" id="update_item">Update</button>')
            $("legend").html('<div class="alert alert-dismissible alert-success"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>Well done!</strong> Successfully completed</div>')
            console.log("Succesfully created...")
        },
        error: function(result){
            $("legend").html('<div class="alert alert-dismissible alert-danger"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>Oh snap!</strong> Something went wrong...</div>')
            console.log("Failed to create...")
        }
    });
});

$('body').on('click','#update_item',(item)=>{
    parent_id = $(".tab-pane.fade.active.in").prop('id').split('-')[1]
    id = $("#id_col > div > input").val()
    name = $("#name_col > div > input").val()
    description = $("#desc_col > div > textarea").val()
    completed = $("#check_col > div > input").prop('checked')
    due_date = $("#date_col > div > div > input").val()
    item = {'id':id,'name':name,'description':description,'completed':completed,'due_date':due_date}
    console.log(JSON.stringify(item))
    $.ajax("api/lists/"+parent_id+"/items/"+id+"/",{
        type: "PUT",
        data: item,
        success: function(result){
            load_lists()
            $(".modal-footer").html("")
            $(".modal-footer").append('<button type="button" class="btn btn-danger col-lg-2" id="delete_item">Delete</button>')
            $(".modal-footer").append('<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>')
            $(".modal-footer").append('<button type="button" class="btn btn-primary" id="update_item">Update</button>')
            $("legend").html('<div class="alert alert-dismissible alert-success"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>Well done!</strong> Successfully completed</div>')
            console.log("Succesfully updated...")
        },
        error: function(result){
            $("legend").html('<div class="alert alert-dismissible alert-danger"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>Oh snap!</strong> Something went wrong...</div>')
            console.log("Failed to update...")
        }
    });
});

$('body').on('click','#delete_item',(item)=>{
    parent_id = $(".tab-pane.fade.active.in").prop('id').split('-')[1]
    id = $("#id_col > div > input").val()
    $.ajax("api/lists/"+parent_id+"/items/"+id+"/",{
        type: "DELETE",
        success: function(result){
            load_lists()
            $("legend").html('<div class="alert alert-dismissible alert-success"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>Well done!</strong> Successfully completed</div>')
            $("#name_col > div > input").val("");
            $("#desc_col > div > textarea").val("");
            $("#check_col > div > input").prop('checked', false);
            $("#date_col > div > div > input").val("");
            $(".modal-footer").html("")
            $(".modal-footer").append('<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>')
            $(".modal-footer").append('<button type="button" class="btn btn-primary" id="create_item">Create</button>')
            console.log("Succesfully deleted...")
        },
        error: function(result){
            $("legend").html('<div class="alert alert-dismissible alert-danger"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>Oh snap!</strong> Something went wrong...</div>')
            console.log("Failed to deleted...")
        }
    });
});

$('body').on('click','#create_list',(item)=>{
    name = $("#name_col > div > input").val()
    description = $("#desc_col > div > textarea").val()
    creation_date = $("#date_col > div > div > input").val()
    list = {'name':name,'description':description, 'creation_date': creation_date}
    console.log(JSON.stringify(list))
    $.ajax("api/lists/",{
        type: "POST",
        data: list,
        success: function(result){
            load_lists()
            $(".modal-footer").html("")
            $(".modal-footer").append('<button type="button" class="btn btn-danger col-lg-2" id="delete_list">Delete</button>')
            $(".modal-footer").append('<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>')
            $(".modal-footer").append('<button type="button" class="btn btn-primary" id="update_list">Update</button>')
            $("legend").html('<div class="alert alert-dismissible alert-success"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>Well done!</strong> Successfully completed</div>')
            console.log("Succesfully created...")
        },
        error: function(result){
            $("legend").html('<div class="alert alert-dismissible alert-danger"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>Oh snap!</strong> Something went wrong...</div>')
            console.log("Failed to create...")
        }
    });
});

$('body').on('click','#create_item_form',(item)=>{
    $("#check_col").show()
    $("legend").html("Item")
    $("#date_col > label").html("Due date")
    $("#name_col > div > input").val("");
    $("#desc_col > div > textarea").val("");
    $("#check_col > div > input").prop('checked', false);
    $("#date_col > div > div > input").val("");
    $(".modal-footer").html("")
    $(".modal-footer").append('<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>')
    $(".modal-footer").append('<button type="button" class="btn btn-primary" id="create_item">Create</button>')
    $("#item-modal").modal();
});


$("document").ready(()=>{
    function getCookie(name) {
      var cookieValue = null;

      if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');

        for (var i = 0; i < cookies.length; i++) {
          var cookie = jQuery.trim(cookies[i]);

          // Does this cookie string begin with the name we want?
          if (cookie.substring(0, name.length + 1) == (name + '=')) {
            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
            break;
          }
        }
      }

      return cookieValue;
    }

    function csrfSafeMethod(method) {
      // these HTTP methods do not require CSRF protection
      return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    function sameOrigin(url) {
      // test that a given url is a same-origin URL
      // url could be relative or scheme relative or absolute
      var host = document.location.host; // host + port
      var protocol = document.location.protocol;
      var sr_origin = '//' + host;
      var origin = protocol + sr_origin;

      // Allow absolute or scheme relative URLs to same origin
      return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
        (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
        // or any other URL that isn't scheme relative or absolute i.e relative.
        !(/^(\/\/|http:|https:).*/.test(url));
    }

    var csrftoken = getCookie(window.drf.csrfCookieName);

    $.ajaxSetup({
      beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && sameOrigin(settings.url)) {
          // Send the token to same-origin, relative URLs only.
          // Send the token only if the method warrants CSRF protection
          // Using the CSRFToken value acquired earlier
          xhr.setRequestHeader(window.drf.csrfHeaderName, csrftoken);
        }
      }
    });
});