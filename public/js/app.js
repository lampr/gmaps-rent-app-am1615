/* js */

var geocoder = new google.maps.Geocoder();
var map;
var marker;
var fields_ok = false;

function geocodePosition(pos) {
  geocoder.geocode({
    latLng: pos
  }, function(responses) {
    if (responses && responses.length > 0) {
      updateMarkerAddress(responses[0].formatted_address);
    } else {
      updateMarkerAddress('Cannot determine address at this location.');
    }
  });
}

function updateMarkerStatus(str) {
  // document.getElementById('markerStatus').innerHTML = str;
}

function updateMarkerPosition(latLng) {
  document.getElementById('hidden_lat').value = latLng.lat();
  document.getElementById('hidden_lng').value = latLng.lng();

//  document.getElementById('lat').innerHTML = latLng.lat();
//  document.getElementById('long').innerHTML = latLng.lng();
}

function updateMarkerAddress(str) {
  document.getElementById('closest-address').innerHTML = str;
}

function initialize() {
  var latLng = new google.maps.LatLng(35.513114, 24.017792);
  // Global var
  map = new google.maps.Map(document.getElementById('mapCanvas'), {
    zoom: 14,
    center: latLng,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });
  // Global var
  marker = new google.maps.Marker({
    position: latLng,
    title: 'Dragg me',
    map: map,
    draggable: true
  });
  
  // Update current position info.
  updateMarkerPosition(latLng);
  geocodePosition(latLng);
  
  // Add dragging event listeners.
  google.maps.event.addListener(marker, 'dragstart', function() {
    updateMarkerAddress('Dragging...');
  });
  
  google.maps.event.addListener(marker, 'drag', function() {
    updateMarkerStatus('Dragging...');
    updateMarkerPosition(marker.getPosition());
  });
  
  google.maps.event.addListener(marker, 'dragend', function() {
    updateMarkerStatus('Drag ended');
    geocodePosition(marker.getPosition());
  });
}

// Onload handler to fire off the app.
google.maps.event.addDomListener(window, 'load', initialize);


function codeAddress() {
  var address = document.getElementById('address').value;
  geocoder.geocode( { 'address': address}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      map.setCenter(results[0].geometry.location);
      marker.setPosition(results[0].geometry.location);
      updateMarkerPosition(results[0].geometry.location);
      geocodePosition(results[0].geometry.location);
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}


/*
 *
 *	FORM
 *
 */



function createPointMarker(){
  var csrf = $(".postit").find('input[name="_csrf"]').val();
  var lat = $("#hidden_lat").val();             //  84.6125467;
  var lng = $("#hidden_lng").val();             // -98.653432;
  var address = $("#closest-address").html();    // "Fire Road, Avon NSW 2574, Australia";
  var tel = $("#telephone").val();
  var description = $("#description").val();
  var photo_id = $("#hidden_photo_id").val();
  var room_type = "shop";
  if ( lat != "" && lng != "" && address != "" && tel != "" && description != "" && room_type != ""){
    $.post("marker/save", { lat: lat, lng: lng, tel: tel, address: address, room_type: room_type, photo_id: photo_id, desc: description, _csrf: csrf })  //, _csrf: csrf
    .done(function(data){
      console.log(data);
      if (data.status==200){
        $(".identifier").html(data.id);
        $(".saved-addr").html(address);
        $(".saved-tel").html(tel);
        $(".saved-room-type").html(room_type);
        $(".saved-desc").html(description);
        var pid = $("#hidden_photo_id").val();
        $(".saved-photo").attr('src', "/assets/" + pid );
        console.log("Success **** " + data.address);
        $('.saved').show();
        $('.postit').hide();
        $('.after_saved').show();        
        setTimeout($('.saved').html("edit"), 2000);         
      }else{
        console.log("Error **** " + data.error);
//        $(".input-field").prop('disabled', false);
      }
    })
  }else{
//    $(".input-field").prop('disabled', false);
    console.log("Bad");
  }
}



function emptyALLfield () {
  $("#closest-address").val("");    // "Fire Road, Avon NSW 2574, Australia";
  $("#telephone").val("");
  $("#description").val("");
  $("#output").val("");
  $("#hidden_photo_id").val("");

}


$(function() {
//Form
  $.ajaxSetup({
    beforeSend: function (){ 
      $('.spinner_save').show(); 

    },
    complete: function (){ 
      $('.spinner_save').hide(); 
    }
  });

//More
  $(".save").live("click", function (e) {
      createPointMarker();
  });

  $(".search").live("click", function (e) {
    if (e.type == "click" || e.keyCode == 13)
      codeAddress();
  });

  $(".new-record").live("click", function(e){
    $(".after_saved").hide();
    $(".postit").show();
    emptyALLfield();
  });

  $("#address").live("keypress", function (e) {
    if (e.keyCode == 13)
      codeAddress();
  });

  // Navigation

  $(".all-records").live("click", function (e) {
    $(".postit").hide(); 
    $.get( "all/markers", function( data ) {
      $( ".all-listings" ).html( data );
      console.log( "Load was performed." );
    });
    $(".all-records-view").show();
  });

  // On save click -> postLatLng

  var isAlreadyPressed = false;
  $(".input-field").keydown(function(evt){
      if (evt.keyCode == 13){
        if(isAlreadyPressed) return;
        isAlreadyPressed = true; 
        postLatLng();
      }  
  });

  // Upload Photo

});








