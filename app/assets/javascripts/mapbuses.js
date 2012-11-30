/*
* Draws using the map with id map_canvas in buses/index.html.erb
* This is the google API key, required to use their maps API
* google api:  AIzaSyAAQDOZpCb33qnlU5xcBmf_n8CQ4p_qg6s
*/
var routeColors = {};
var markers = {};
var openinfo;

function drawRoutes() {
  show_debug("Loading routes...");
  var routesLayer = new google.maps.KmlLayer('http://www.searcharoo.net/SearchKml/newyork.kml');//routes2.kmz');
  show_debug("loaded layer...");
  routesLayer.setMap(map);
}

function updateMarkers(buses){
  for(var i=0; i<buses.length; i++)
  {
    bus=buses[i];
    
    if(bus != null){
      col=routeColors[bus.wmataid]
      if(col == undefined){
        col=get_random_color();
        routeColors[bus.wmataid]=col;
      }
      busTime=parseISO8601(bus.last_update);
      if(isAncient(busTime)){
        //remove bus
        if(markers[bus.busid] != null){
          markers[bus.busid].setMap(null);
        }
      }else{
        drawBus(col, bus);  
      }
    }
    
    //Thanks google...
    //https://developers.google.com/maps/documentation/javascript/overlays#MarkerAnimations
    /*
    setTimeout(function(){
      drawBus(col, bus)
    }, i*20);
  */
  }
  show_debug("updated "+buses.length+" markers");
}

function drawBus(pinColor, bus){
 //Update marker position if it already exists...
 if(markers[bus.busid] != null){
    updateExistingMarker(pinColor, bus);
  }else{
    //Or create a new marker if it doesnt
    makeNewMarker(pinColor, bus);
  }//end else
}

function makeMarker(pinColor, bus){
  busTime=parseISO8601(bus.last_update);
  if(!isStale(busTime)){ 
    return new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
      new google.maps.Size(21, 34),
      new google.maps.Point(0,0),
      new google.maps.Point(10, 34));
  }
  return new google.maps.MarkerImage('stale.png',
    new google.maps.Size(21, 34),
    new google.maps.Point(0,0),
    new google.maps.Point(10, 34)); 
}

function updateExistingMarker(pinColor, bus){
  var myLatlng = new google.maps.LatLng(bus.lat, bus.lon);
  if(!markers[bus.busid].getPosition().equals(myLatlng)){
      markers[bus.busid].setPosition(myLatlng);
      markers[bus.busid].setAnimation(google.maps.Animation.BOUNCE);
      //Turn off the bouncing in 3 seconds...
      setTimeout(function(){
        var myMarker = markers[bus.busid];
        myMarker.setAnimation(null);
      }, 3000);
    }
    var mkImg = makeMarker(pinColor, bus);
    markers[bus.busid].setIcon(mkImg);
}

function makeNewMarker(pinColor, bus){
  var myLatlng = new google.maps.LatLng(bus.lat, bus.lon);
  var pinImage=makeMarker(pinColor,bus);
  var marker = new google.maps.Marker({
     position: myLatlng,
     map: map,
     title:bus.wmataid+": "+bus.headsign+" ("+bus.busid+")",
     icon: pinImage,
     title:bus.headsign,
     optimized: false // http://stackoverflow.com/questions/8721327/effects-and-animations-with-google-maps-markers/8722970#8722970
  });
  markers[bus.busid] = marker;
  marker.setMap(map);
  
  google.maps.event.addListener(marker, 'click', function() {
    var busid = bus.id;
    pollPath("/buses/"+busid+"/", function(){
      if(openinfo != null){
        openinfo.close();
      }
      var infowindow = new google.maps.InfoWindow({ content: request.responseText });
      infowindow.open(map,marker);
      openinfo=infowindow;
    });
  }); 
}


function initialize() {
  navigator.geolocation.getCurrentPosition(showPosition,showError);

  // var mapOptions = {
  //   center: new google.maps.LatLng(lat, lon),
  //   zoom: 14,
  //   mapTypeId: google.maps.MapTypeId.ROADMAP
  // };
  // map = new google.maps.Map(document.getElementById("map_canvas"),
  //     mapOptions);

// //We'd like this to be toggleable, it's too much with everything else
// //    var trafficLayer = new google.maps.TrafficLayer();
// //    trafficLayer.setMap(map);
}

function showPosition(position)
{ 
  lat = position.coords.latitude;
  lon = position.coords.longitude;
  // var latlon=position.coords.latitude+","+position.coords.longitude;
  // var img_url="http://maps.googleapis.com/maps/api/staticmap?center="
  // +latlon+"&zoom=14&size=400x300&sensor=false";
  // document.getElementById("map_canvas").innerHTML="<img src='"+img_url+"'>";
  var mapOptions = {
    center: new google.maps.LatLng(lat, lon),
    zoom: 14,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById("map_canvas"),
      mapOptions);
  var transitLayer = new google.maps.TransitLayer();
  transitLayer.setMap(map);

  drawRoutes();
  //Starts a cycle of polling for bus positions
  //every four seconds
  setInterval(poll, 15000);
}


function showError(error)
  {
    lat = 38.89;
    lon = -77.03; 
  switch(error.code) 
    {
    case error.PERMISSION_DENIED:
      alert("User denied the request for Geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      alert("Location information is unavailable.");
      break;
    case error.TIMEOUT:
      alert("The request to get user location timed out.");
      break;
    case error.UNKNOWN_ERROR:
      alert("An unknown error occurred.");
      break;
    }
  } 
window.onload = initialize;




 