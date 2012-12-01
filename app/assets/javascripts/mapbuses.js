/*
* Draws using the map with id map_canvas in buses/index.html.erb
* This is the google API key, required to use their maps API
* google api:  AIzaSyAAQDOZpCb33qnlU5xcBmf_n8CQ4p_qg6s
*/
var routeColors = {};
var markers = {};
var openinfo;

var routeKML = [];
var routePath=null;

var activeRoute=null;

function drawRoutesKML() {
  routeKML[0] = new google.maps.KmlLayer('http://iancwill.com/1.kmz',{preserveViewport: true});
  routeKML[0].setMap(map);
  routeKML[1] = new google.maps.KmlLayer('http://iancwill.com/2.kmz',{preserveViewport: true});
  routeKML[1].setMap(map);
  routeKML[2] = new google.maps.KmlLayer('http://iancwill.com/3.kmz',{preserveViewport: true});
  routeKML[2].setMap(map);
  routeKML[3] = new google.maps.KmlLayer('http://iancwill.com/4.kmz',{preserveViewport: true});
  routeKML[3].setMap(map);
  show_debug("Loaded route KML...");

  for(var i=0; i<routeKML.length; i++){
    google.maps.event.addListener(routeKML[i], 'click', function(kmlEvent) {
      var text = kmlEvent.featureData.name;
      show_debug("Selected: "+text);
      activeRoute=text;
      $.getScript("routes/busroute"+activeRoute+".json", drawRoute);
      hideRouteKML();
      filterBusMarkers();    
    });
  }
}

function drawRoute() {
//load the given route and plot it....
  var routeCoordinates=[];
  //Sometimes direction0 is null....
  if(RouteDetails.Direction0 == null)
  {
    return;
  }
  var shape = RouteDetails.Direction0.Shape;
  for (var i=0; i<shape.length; i++)
  {
    routeCoordinates[i] = new google.maps.LatLng(shape[i].Lat, shape[i].Lon);
  }
  var color = get_random_color();
  routeColors[RouteDetails.RouteID] = color;
  routePath = new google.maps.Polyline({
    path: routeCoordinates,
    strokeColor: '#'+color,
    strokeOpacity: 0.9,
    strokeWeight: 6
  });
  routePath.setMap(map);
}

function filterBusMarkers()
{
  if(buses == null){
    return;
  }
  showFilterRoute();
  for(var i=0; i<buses.length; i++){
    bus=buses[i];
    if(markers[bus.busid] != null){
      if(shouldHide(bus))
      {
        markers[bus.busid].setMap(null);
      }
    }
  }

}

function showFilterRoute()
{
  if(activeRoute == null)
  {
    $("#menu_status_area").text("Showing all routes");
  }else{
    $("#menu_status_area").text("Showing route "+activeRoute);
  }
}

function shouldHide(bus){
  return activeRoute != null && bus.wmataid != activeRoute;
}

function hideRouteKML()
{
  for(var i=0; i<routeKML.length; i++){
    routeKML[i].setMap(null);  
  }
}


function showRouteKML()
{
  for(var i=0; i<routeKML.length; i++){
    routeKML[i].setMap(map);
  }
}

function showAll(){
  activeRoute=null;
  
  updateBusMarkers();
  showRouteKML();
  showFilterRoute();
  if(routePath != null){
    routePath.setMap(null);
  }
}


function updateBusMarkers(){
  if(buses == null || buses.length == 0)
  {
    return
  }
  for(var i=0; i<buses.length; i++)
  {
    //buses
    bus=buses[i];
    
    if(bus != null){
      col=routeColors[bus.wmataid]
      if(col == undefined){
        col=get_random_color();
        routeColors[bus.wmataid]=col;
      }
      busTime=parseISO8601(bus.last_update);
      if(isAncient(busTime) || shouldHide(bus)){
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

  show_debug("Showing "+buses.length+" buses");
}

function updateStopMarkers(stops){
  for (var i=0; i<stops.length; i++)
  {
      //stops
      stop = stops[i];
      col = routeColors[stop.stopid]
      if(col == undefined){
        col = get_random_color();
        routeColors[stop.stopid]=col;
      }
      // if(stop.draw == true){
        drawStop(col,stop);
      // }
  }

  show_debug("Showing "+buses.length+" stops");
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
    markers[bus.busid].setMap(map);
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

function drawStop(pinColor, stop){
  var myLatlng = new google.maps.LatLng(stop.lat, stop.lon);
  stopTime=parseISO8601(stop.last_update);
  //Update marker position if it already exists...
  if(markers[stop.stopid] != null){
    if(!markers[stop.stopid].getPosition().equals(myLatlng)){
      markers[stop.stopid].setPosition(myLatlng);
      markers[stop.stopid].setAnimation(google.maps.Animation.BOUNCE);
      //Turn off the bouncing in 3 seconds...
      setTimeout(function(){
        var myMarker = markers[stop.stopid];
        myMarker.setAnimation(null);
      }, 3000);
    }
    if (isStale(stopTime)){
      markers[stop.stopid].setIcon(new google.maps.MarkerImage('stale.png'),
        new google.maps.Size(21, 34),
        new google.maps.Point(0,0),
        new google.maps.Point(10, 34)
        );
    }else{
       markers[stop.stopid].setIcon(new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
    new google.maps.Size(21, 34),
    new google.maps.Point(0,0),
    new google.maps.Point(10, 34)));
    }
  }else{
    //Or create a new marker if it doesnt
    var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
    new google.maps.Size(21, 34),
    new google.maps.Point(0,0),
    new google.maps.Point(10, 34));

    if(!isStale(stopTime)){ pinImage = new google.maps.MarkerImage('stale.png',
    new google.maps.Size(21, 34),
    new google.maps.Point(0,0),
    new google.maps.Point(10, 34)); }

    var marker = new google.maps.Marker({
       position: myLatlng,
       map: map,
       title:stop.name,
       icon: pinImage,
       optimized: false // http://stackoverflow.com/questions/8721327/effects-and-animations-with-google-maps-markers/8722970#8722970
    });
    markers[stop.stopid] = marker;
    marker.setMap(map);
        //TODO: List when the next buses will be here and what they are
        var content = "<h3>"+stop.name+": "+stop.stopid+"</h3><br/>"
  if(stop.last_update != null){
    content = content+"<div>Last update: "+busTime.toLocaleString()+"</div><br/>"
  }
  content = content+"<a href='#' class='btn btn-large'>Watch</a>"

    var infowindow = new google.maps.InfoWindow({
       content: content
    });
    google.maps.event.addListener(marker, 'click', function() {
      if(openinfo != null){
        openinfo.close();
      }
      infowindow.open(map,marker);
      openinfo=infowindow;
    });
  }
}

function initialize() {
  show_debug("initializing...");
  $("#show_all").bind("click", function(){showAll()});
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

  //Starts a ````cycle of polling for bus positions
  drawRoutesKML();

  if(true){
    setInterval(pollBuses, 15000);
  }
  else if(gon.stopBus == true){
    setInterval(pollStops, 15000);
  }
}


function showError(error)
  {
    lat = 38.89;
    lon = -77.03; 
  } 
window.onload = initialize;




 