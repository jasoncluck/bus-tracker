/*
* Draws using the map with id map_canvas in buses/index.html.erb
* This is the google API key, required to use their maps API
* google api:  AIzaSyAAQDOZpCb33qnlU5xcBmf_n8CQ4p_qg6s
*/
var routeColors = {};
var markers = {};
var openinfo;

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
  var routePath = new google.maps.Polyline({
    path: routeCoordinates,
    strokeColor: '#'+color,
    strokeOpacity: 0.5,
    strokeWeight: 2
  });
  routePath.setMap(map);
}

function updateBusMarkers(buses){
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
      show_debug("drawing pin "+i+" for id: "+bus.id+", busid: "+bus.busid+", wmataid: "+bus.wmataid+"...");
	  if(bus.draw == true){
        drawBus(col, bus);
	  }
      show_debug('(done)');
    }
    
    //Thanks google...
    //https://developers.google.com/maps/documentation/javascript/overlays#MarkerAnimations
    /*
    setTimeout(function(){
      drawBus(col, bus)
    }, i*20);
  */
  }
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
      if(stop.draw == true){
        drawStop(col,stop);
      }
  }

}

function drawBus(pinColor, bus){
  //show_debug("in draw bus with id "+bus.busid+"...");
  var myLatlng = new google.maps.LatLng(bus.lat, bus.lon);
  busTime=parseISO8601(bus.last_update);
 //Update marker position if it already exists...
  if(markers[bus.busid] != null){
    show_debug("markers["+bus.busid+"] does exist");
    if(!markers[bus.busid].getPosition().equals(myLatlng)){
      show_debug('new position...');
      markers[bus.busid].setPosition(myLatlng);
      markers[bus.busid].setAnimation(google.maps.Animation.BOUNCE);
      //Turn off the bouncing in 3 seconds...
      setTimeout(function(){
        var myMarker = markers[bus.busid];
        myMarker.setAnimation(null);
      }, 3000);
    }
    if (isStale(busTime)){
      show_debug('stale...');
      markers[bus.busid].setIcon(new google.maps.MarkerImage('stale.png'),
        new google.maps.Size(21, 34),
        new google.maps.Point(0,0),
        new google.maps.Point(10, 34)
        );
    }else{
      show_debug('not stale, polling google...');
       markers[bus.busid].setIcon(new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
    new google.maps.Size(21, 34),
    new google.maps.Point(0,0),
    new google.maps.Point(10, 34)));
    }
  }else{
    //Or create a new marker if it doesnt
    show_debug('new marker, polling google...');
    var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
    new google.maps.Size(21, 34),
    new google.maps.Point(0,0),
    new google.maps.Point(10, 34));
    show_debug('done with google poll.');

    if(!isStale(busTime)){ pinImage = new google.maps.MarkerImage('stale.png',
    new google.maps.Size(21, 34),
    new google.maps.Point(0,0),
    new google.maps.Point(10, 34)); }

    var marker = new google.maps.Marker({
       position: myLatlng,
       map: map,
       title:bus.wmataid+": "+bus.headsign+" ("+bus.busid+")",
       icon: pinImage,
       title:bus.headsign,
       optimized: false // http://stackoverflow.com/questions/8721327/effects-and-animations-with-google-maps-markers/8722970#8722970
    });
    markers[bus.busid] = marker;
    show_debug("adding "+bus.busid+" to map");
    marker.setMap(map);
    
    show_debug("making info window for "+bus.busid);
    
    show_debug("adding maps listener for "+bus.busid);
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
  }//end else
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

  
  for(var rIdx=0; rIdx < routes.length; rIdx++)
  {
    $.getScript("routes/busroute"+routes[rIdx]+".json", drawRoute);
  }
  //Starts a ````cycle of polling for bus positions

  if(gon.busBool == true){
    pollBuses()
  }
  else if(gon.stopBus == true){
    pollStops()  
  }
}


function showError(error)
  {
    lat = 38.89;
    lon = -77.03; 
  } 
window.onload = initialize()




 