/*
* Draws using the map with id map_canvas in buses/index.html.erb
* This is the google API key, required to use their maps API
* google api:  AIzaSyAAQDOZpCb33qnlU5xcBmf_n8CQ4p_qg6s
*/

/*
 * Variables inserted by Rails in map/index.html.erb
 *
    var routes=<%=raw insert_routes %>;
    var routeColors=<%= raw insert_route_colors %>;
    var map;
    var busLocations;
*/
var markers = {};

/*
 * openinfo is used to make sure there's only one open info window at any given time
 * when opening a new window, if this isn't null, it will be closed and then reassinged
*/
var openinfo;
var routeKML = [];
var routePath=null;
var stopMarkers=[];

var activeRoute=null;
var filter_buses=false;

function drawRoutesKML() {
  routeKML[0] = new google.maps.KmlLayer('http://iancwill.com/1.kmz?new4plz',{preserveViewport: true});
  routeKML[0].setMap(map);
  routeKML[1] = new google.maps.KmlLayer('http://iancwill.com/2.kmz?new4plz',{preserveViewport: true});
  routeKML[1].setMap(map);
  routeKML[2] = new google.maps.KmlLayer('http://iancwill.com/3.kmz?new4plz',{preserveViewport: true});
  routeKML[2].setMap(map);
  routeKML[3] = new google.maps.KmlLayer('http://iancwill.com/4.kmz?new4plz',{preserveViewport: true});
  routeKML[3].setMap(map);
  show_debug("Loaded route KML...");

  for(var i=0; i<routeKML.length; i++){
    google.maps.event.addListener(routeKML[i], 'click', function(kmlEvent) {
      var routeid=kmlEvent.featureData.name;
      primeRoute(routeid);
    });
  }
}

function primeAndFocus(routeid)
{
  primeRoute(routeid);
  focusRoute();
}

// This is called from the KML layer callback for routes, and also from the 
// info window focus for a bus (the Focus button action, defined in buses/show.html.erb points here)
function primeRoute(routeid)
{
  activeRoute=routeid;
  $("#show_all").text("Show Only Route "+activeRoute);
  $("#show_all").unbind("click", showAll);
  $("#show_all").bind("click", focusRoute);
}

function focusRoute(){
      var routeid=activeRoute;
      if(activeRoute == null){
        return;
      }
      $.getScript("routes/busroute"+routeid+".json", drawRoute);
      filter_buses=true;
      hideRouteKML();
      filterBusMarkers();
      showStops();
      $("#show_all").text("Show All");
      $("#show_all").unbind("click", focusRoute);
      $("#show_all").bind("click", showAll);
}

function showAll(){
  activeRoute=null;
  filter_buses=false;
  updateBusMarkers();
  hideStops();
  showRouteKML();
  showFilterRoute();
  clearRoutePath();
}

function clearRoutePath()
{
  if(routePath != null)
  {
    for(var i=0; i<routePath.length; i++)
    {
      routePath[i].setMap(null);
    }
  }
}

function colorForRoute(route_id){
  color_key = route_id.replace(/[a-z].*/, '');
  color=routeColors[color_key]
  if(color == undefined){
    show_debug("Warning, route color for "+color_key+" not defined, generating random color...")
    color=get_random_color();
    routeColors[color_key]=color;
  }
  //KML uses BGR rather than RGB colors, so to get them to match
  // we flip it here (from BGR to RGB)...
  return color.substring(4,6)+color.substring(2,4)+color.substring(0,2);
}

function drawRoute() {
//load the given route and plot it....
  
  //Sometimes direction0 is null....
  clearRoutePath();
  routePath=[]
  if(RouteDetails.Direction0 != null)
  {
    routePath.push(drawShape(RouteDetails.Direction0.Shape));
  }
  if(RouteDetails.Direction1 != null)
  {
    routePath.push(drawShape(RouteDetails.Direction1.Shape));
  }
}

function drawShape(shape){
  var routeCoordinates=[];
  for (var i=0; i<shape.length; i++)
  {
    routeCoordinates[i] = new google.maps.LatLng(shape[i].Lat, shape[i].Lon);
  }
  color = colorForRoute(RouteDetails.RouteID);
  var rp = new google.maps.Polyline({
    path: routeCoordinates,
    strokeColor: '#'+color,
    strokeOpacity: 0.9,
    strokeWeight: 6
  });
  rp.setMap(map);
  return rp;
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
  return (filter_buses && activeRoute != null) && (bus.wmataid != activeRoute);
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
      busTime=parseISO8601(bus.last_update);
      if(isAncient(busTime) || shouldHide(bus)){
        //remove bus
        if(markers[bus.busid] != null){
          markers[bus.busid].setMap(null);
        }
      }else{
        drawBus(bus);
      }
    }
  }

  var myDate = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
  show_debug("Showing "+buses.length+" buses at "+myDate);
}

function showStops(){
  if(activeRoute == null)
  {
    return;
  }
  show_debug("Polling stops...");
  pollStops(activeRoute);
}

function hideStops(){
  for(var i=0; i<stopMarkers.length; i++){
    stopMarkers[i].setMap(null);
  }
  stopMarkers=[];
}

function updateStopMarkers(stops){
  show_debug("Got some stops to draw...");
  for (var i=0; i<stops.length; i++)
  {
      //stops
      stop = stops[i];
      var marker = drawStop(stop);
      setStopInfoWindow(marker, stops[i]);
      stopMarkers.push(marker);
  }
  show_debug("Showing "+stops.length+" stops");
}



/*
 * We don't have to keep track of as much with stops, since they don't move.  We just draw them when a route
 * has focus, and hide them when it doesn't
 */
function drawStop(stop){
  col = colorForRoute(activeRoute);
  var myLatlng = new google.maps.LatLng(stop.lat, stop.lon);

  var marker = new google.maps.Marker({
     position: myLatlng,
     map: map,
     title:stop.name+": ("+stop.stopid+")",
     icon: makeStopMarker(col),
     title:stop.name,
     optimized: false // http://stackoverflow.com/questions/8721327/effects-and-animations-with-google-maps-markers/8722970#8722970
  });
  marker.setMap(map);
  return marker;
}

function setStopInfoWindow(marker, stop){
  google.maps.event.addListener(marker, 'click', function() {
    pollPath("/stops/"+stop.id+"?minimal=true", http_nonsense_wrapper(function(responseText){    
      if(openinfo != null){
        openinfo.close();
      }
      var infowindow = new google.maps.InfoWindow({ content: responseText });
      infowindow.open(map,marker);
      openinfo=infowindow;

      //When the info window start, also start polling for the next bus to arrive...

      updatePrediction(stop.id);
      //setInterval(function(){updatePrediction(stop.stopid);}, 5000);
      }));
  }); 
}

function updatePrediction(stop_id){
  url="stops/"+stop_id+"/prediction?minimal=true"
  pollPath(url, http_nonsense_wrapper(newStopPrediction));
}


function newStopPrediction(content_text){
  $("#bubble_stop_prediction").html(content_text);
}


function drawBus(bus){
 //Update marker position if it already exists...
 if(markers[bus.busid] != null){
    updateExistingMarker(bus);
  }else{
    //Or create a new marker if it doesnt
    makeNewMarker(bus);
  }//end else
}

function makePinMarker(pinColor)
{
  return new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
    new google.maps.Size(21, 34),
    new google.maps.Point(0,0),
    new google.maps.Point(10, 34));
}

function makeStopMarker(color)
{
  return {
    anchor: new google.maps.Point(70, 70),
    path: "M55.479,57.993h-1.102c-2.282,0-4.15,1.868-4.15,4.136v1.108c0,2.221,1.773,4.036,3.972,4.132v21.575h-0.585  c-1.258,0-2.281,1.023-2.281,2.282h7.06c0-1.259-1.027-2.282-2.289-2.282h-0.449V67.37c2.2-0.095,3.961-1.911,3.961-4.133v-1.108  C59.615,59.861,57.761,57.993,55.479,57.993z M91.906,52.884h-7.455c0-1.826-1.475-3.302-3.305-3.302h-3.598  c-1.828,0-3.305,1.476-3.305,3.302h-7.349c-2.51,0-4.648,2.046-4.648,4.553v26.316c0,1.69,1.301,3.062,2.98,3.062h0.816v1.572  c0,1.69,1.358,3.056,3.062,3.056c1.68,0,3.049-1.365,3.049-3.056v-1.572h14.279v1.572c0,1.69,1.365,3.056,3.057,3.056  c1.689,0,3.062-1.365,3.062-3.056v-1.572h0.816c1.68,0,3.072-1.372,3.072-3.062V57.437C96.441,54.93,94.414,52.884,91.906,52.884z   M64.506,57.44c0-1.312,1.07-2.382,2.393-2.382h25.005c1.311,0,2.381,1.069,2.381,2.382v0.338c0,1.284-1.094,2.368-2.381,2.368  H66.899c-1.322,0-2.393-1.06-2.393-2.368V57.44z M66.953,83.222c-1.501,0-2.721-1.212-2.721-2.721c0-1.501,1.22-2.72,2.721-2.72  S69.68,79,69.68,80.501C69.68,82.01,68.454,83.222,66.953,83.222z M66.899,73.182c-1.322,0-2.393-1.062-2.393-2.371v-6.593  c0-1.305,1.07-2.374,2.393-2.374h25.005c1.311,0,2.381,1.069,2.381,2.374v6.593c0,1.283-1.094,2.371-2.381,2.371H66.899z   M91.736,83.222c-1.512,0-2.732-1.212-2.732-2.721c0-1.501,1.221-2.72,2.732-2.72c1.5,0,2.721,1.219,2.721,2.72  C94.457,82.01,93.236,83.222,91.736,83.222z",
    fillColor: "#"+color,
    fillOpacity: 0.7,
    scale: 0.4,
    strokeColor: "#"+color,
    strokeWeight: 0.5
  };
}

function makeMarker(bus){
  var color = colorForRoute(bus.wmataid);
    // Roration is clockwise degrees
  var rot = 0;
  
  var west_path = "M 129.27804,338.45161 C 126.69532,337.531 122.67537,334.96481 120.34481,332.74894 C 100.2604,313.65296 117.70112,280.53965 144.46203,286.95949 C 155.62149,289.63661 164.8738,301.52866 164.8738,313.19487 C 164.8738,319.94706 161.25054,327.79447 155.82306,332.79735 C 148.06919,339.94462 138.92874,341.8916 129.27804,338.45161 z M 146.7906,322.14862 C 149.62093,319.3183 150.33267,317.54629 150.33267,313.33005 C 150.33267,310.42796 149.53645,306.91677 148.56329,305.52738 C 144.25935,299.38265 133.76736,298.90036 128.41183,304.60105 C 126.12886,307.03118 125.49157,309.03334 125.49157,313.77563 C 125.49157,318.9197 126.00835,320.28624 128.89149,322.76621 C 133.98403,327.14664 142.07165,326.86758 146.7906,322.14862 z M 334.13715,338.47621 C 323.43325,334.65872 316.41928,324.42129 316.3705,312.54446 C 316.33729,304.45544 318.75186,299.26016 325.38708,293.14403 C 342.28037,277.57234 369.60815,289.82268 369.60815,312.96721 C 369.60815,331.38005 351.2527,344.58039 334.13715,338.47621 z M 351.39175,321.9622 C 359.38568,313.96826 354.31365,300.24372 343.36547,300.24372 C 331.0767,300.24372 325.40114,314.80208 334.65448,322.58825 C 340.01014,327.09473 346.50204,326.8519 351.39175,321.9622 z M 49.436815,321.75247 C 45.491935,318.75686 44.909485,313.64658 44.909485,282.0306 L 44.909485,250.64586 L 48.377025,246.66548 L 51.844565,242.68509 L 53.259015,211.17931 C 55.426365,162.90316 55.306015,163.60821 61.840555,160.90836 C 63.934705,160.04313 122.39644,159.74445 246.66765,159.9641 L 428.43177,160.28536 L 434.49057,163.07389 C 442.156,166.60187 447.75858,171.95418 451.86636,179.67353 L 455.09051,185.73233 L 455.09051,242.50886 L 455.09051,299.28539 L 416.31416,311.26946 C 394.98717,317.8607 377.18055,323.25661 376.7439,323.26035 C 376.30725,323.26411 376.23786,320.09254 376.58969,316.21244 C 378.45911,295.59609 362.92304,278.43203 342.39268,278.43203 C 333.884,278.43203 326.03799,281.90924 319.26576,288.68147 C 311.39833,296.54891 308.49529,304.44677 309.3871,315.55686 L 310.00601,323.26717 L 239.78177,323.26717 L 169.55752,323.26717 L 170.47468,320.54071 C 172.21368,315.37115 171.25975,304.54857 168.55861,298.80214 C 158.68054,277.78745 132.63033,272.4453 115.09798,287.83891 C 107.91442,294.14616 104.89164,301.67731 104.89164,313.26769 L 104.89164,323.26225 L 78.161575,323.26471 C 58.645915,323.26651 50.893135,322.85836 49.436815,321.75247 z M 94.671345,302.62461 C 96.935655,301.41279 97.015205,299.50862 97.015205,246.52009 C 97.015205,205.47456 96.649235,191.30399 95.561085,190.21585 C 94.664695,189.31946 90.265745,188.76174 84.091995,188.76174 C 75.333575,188.76174 73.915075,189.06433 72.786315,191.17343 C 71.913595,192.80412 71.605475,211.06598 71.834865,247.56515 C 72.126545,293.97691 72.428945,301.70618 73.991745,302.69354 C 76.443455,304.24248 91.743595,304.19149 94.671345,302.62461 z M 186.19474,234.68142 C 188.25961,232.39979 188.50313,230.11209 188.50313,212.99695 C 188.50313,195.88182 188.25961,193.59412 186.19474,191.31248 C 183.95748,188.84032 182.88681,188.76174 151.44318,188.76174 C 124.10654,188.76174 118.71162,189.05011 117.16788,190.59385 C 114.48333,193.2784 113.58306,201.74613 114.25293,218.01114 C 115.10952,238.80969 112.04891,237.23217 151.54443,237.23217 C 182.88512,237.23217 183.95782,237.1532 186.19474,234.68142 z M 269.76244,235.51303 C 271.93049,233.92848 272.11463,232.18829 272.11463,213.28366 C 272.11463,197.68172 271.71663,192.2934 270.45156,190.76758 C 268.97936,188.99197 265.05018,188.76174 236.21931,188.76174 C 205.26582,188.76174 203.52991,188.88196 201.22662,191.18526 C 199.00791,193.40397 198.8031,195.22446 198.8031,212.72733 C 198.8031,228.06991 199.17565,232.37778 200.68945,234.53902 C 202.55882,237.20792 202.86766,237.23217 234.99302,237.23217 C 261.06961,237.23217 267.87034,236.89591 269.76244,235.51303 z M 352.31568,234.59742 C 355.02436,232.05274 355.12024,231.28872 355.12024,212.24856 C 355.12024,193.25022 355.02246,192.46595 352.42709,190.64809 C 350.15867,189.05923 344.80775,188.76174 318.49779,188.76174 C 278.8402,188.76174 282.10522,186.55905 282.63528,212.95569 C 282.97335,229.79152 283.30286,232.44967 285.32886,234.68513 C 287.55966,237.14655 288.67715,237.23217 318.57419,237.23217 C 348.67011,237.23217 349.58736,237.16054 352.31568,234.59742 z M 438.05715,234.53902 C 440.91849,230.45387 440.74457,203.05729 437.82104,197.34683 C 433.76709,189.42836 430.76458,188.76174 399.15342,188.76174 L 371.04903,188.76174 L 368.53756,191.95456 C 366.25181,194.86041 366.02609,196.77131 366.02609,213.21545 C 366.02609,230.78316 366.10845,231.36589 369.00041,234.25784 L 371.97473,237.23217 L 404.07276,237.23217 C 435.86828,237.23217 436.18856,237.20678 438.05715,234.53902 z ";
  var east_path = "m 370.72195,338.45161 c 2.58273,-0.92061 6.60268,-3.4868 8.93324,-5.70267 20.0844,-19.09598 2.64368,-52.20929 -24.11723,-45.78945 -11.15945,2.67712 -20.41176,14.56917 -20.41176,26.23538 0,6.75219 3.62325,14.5996 9.05074,19.60248 7.75387,7.14727 16.89431,9.09425 26.54501,5.65426 z m -17.51256,-16.30299 c -2.83032,-2.83032 -3.54207,-4.60233 -3.54207,-8.81857 0,-2.90209 0.79622,-6.41328 1.76939,-7.80267 4.30393,-6.14473 14.79593,-6.62702 20.15145,-0.92633 2.28297,2.43013 2.92026,4.43229 2.92026,9.17458 0,5.14407 -0.51678,6.51061 -3.39991,8.99058 -5.09254,4.38043 -13.18016,4.10137 -17.89912,-0.61759 z m -187.34655,16.32759 c 10.70391,-3.81749 17.71787,-14.05492 17.76666,-25.93175 0.0332,-8.08902 -2.38137,-13.2843 -9.01659,-19.40043 -16.89329,-15.57169 -44.22107,-3.32135 -44.22107,19.82318 0,18.41284 18.35545,31.61318 35.471,25.509 z m -17.2546,-16.51401 c -7.99392,-7.99394 -2.92189,-21.71848 8.02628,-21.71848 12.28877,0 17.96434,14.55836 8.711,22.34453 -5.35566,4.50648 -11.84757,4.26365 -16.73728,-0.62605 z m 301.95494,-0.20973 c 3.94488,-2.99561 4.52733,-8.10589 4.52733,-39.72187 l 0,-31.38474 -3.46754,-3.98038 -3.46754,-3.98039 -1.41445,-31.50578 c -2.16735,-48.27615 -2.047,-47.5711 -8.58154,-50.27095 -2.09415,-0.86523 -60.55588,-1.16391 -184.8271,-0.94426 l -181.764115,0.32126 -6.0588,2.78853 c -7.66543,3.52798 -13.26801,8.88029 -17.37579,16.59964 l -3.22415,6.0588 0,56.77653 0,56.77653 38.77635,11.98407 c 21.326995,6.59124 39.133615,11.98715 39.570265,11.99089 0.43665,0.004 0.50604,-3.16781 0.1542,-7.04791 -1.86941,-20.61635 13.66665,-37.78041 34.19702,-37.78041 8.50867,0 16.35469,3.47721 23.12691,10.24944 7.86744,7.86744 10.77047,15.7653 9.87867,26.87539 l -0.61892,7.71031 70.22425,0 70.22424,0 -0.91716,-2.72646 c -1.739,-5.16956 -0.78506,-15.99214 1.91608,-21.73857 9.87806,-21.01469 35.92828,-26.35684 53.46062,-10.96323 7.18356,6.30725 10.20635,13.8384 10.20635,25.42878 l 0,9.99456 26.73006,0.002 c 19.51566,0.002 27.26844,-0.40635 28.72476,-1.51224 z m -45.23453,-19.12786 c -2.26431,-1.21182 -2.34386,-3.11599 -2.34386,-56.10452 0,-41.04553 0.36597,-55.2161 1.45412,-56.30424 0.89639,-0.89639 5.29534,-1.45411 11.46909,-1.45411 8.75842,0 10.17692,0.30259 11.30568,2.41169 0.87272,1.63069 1.18084,19.89255 0.95145,56.39172 -0.29168,46.41176 -0.59408,54.14103 -2.15688,55.12839 -2.45171,1.54894 -17.75185,1.49795 -20.6796,-0.0689 z m -91.5234,-67.94319 c -2.06487,-2.28163 -2.30838,-4.56933 -2.30838,-21.68447 0,-17.11513 0.24351,-19.40283 2.30838,-21.68447 2.23726,-2.47216 3.30794,-2.55074 34.75157,-2.55074 27.33664,0 32.73156,0.28837 34.2753,1.83211 2.68454,2.68455 3.58482,11.15228 2.91495,27.41729 -0.85659,20.79855 2.20402,19.22103 -37.29151,19.22103 -31.34069,0 -32.41338,-0.079 -34.65031,-2.55075 z m -83.5677,0.83161 c -2.16805,-1.58455 -2.35218,-3.32474 -2.35218,-22.22937 0,-15.60194 0.39799,-20.99026 1.66307,-22.51608 1.4722,-1.77561 5.40137,-2.00584 34.23224,-2.00584 30.9535,0 32.68941,0.12022 34.99269,2.42352 2.21871,2.21871 2.42353,4.0392 2.42353,21.54207 0,15.34258 -0.37256,19.65045 -1.88635,21.81169 -1.86937,2.6689 -2.17822,2.69315 -34.30358,2.69315 -26.07659,0 -32.87731,-0.33626 -34.76942,-1.71914 z m -82.55323,-0.91561 c -2.70869,-2.54468 -2.80457,-3.3087 -2.80457,-22.34886 0,-18.99834 0.0978,-19.78261 2.69315,-21.60047 2.26843,-1.58886 7.61935,-1.88635 33.9293,-1.88635 39.6576,0 36.39258,-2.20269 35.86251,24.19395 -0.33806,16.83583 -0.66758,19.49398 -2.69358,21.72944 -2.2308,2.46142 -3.34828,2.54704 -33.24532,2.54704 -30.09593,0 -31.01317,-0.0716 -33.74149,-2.63475 z m -85.741475,-0.0584 c -2.86134,-4.08515 -2.68742,-31.48173 0.23611,-37.19219 4.05395,-7.91847 7.05646,-8.58509 38.667625,-8.58509 l 28.10438,0 2.51148,3.19282 c 2.28575,2.90585 2.51146,4.81675 2.51146,21.26089 0,17.56771 -0.0824,18.15044 -2.97431,21.04239 l -2.97433,2.97433 -32.098025,0 c -31.79552,0 -32.1158,-0.0254 -33.98439,-2.69315 z";
  var path = west_path;
  if( bus.direction == "EAST"){
    path=east_path;
  }
  if( bus.direction == "NORTH"){
    rot = 90;
  }
  if( bus.direction == "SOUTH"){
    rot = 270;
  }

  return {
    anchor: new google.maps.Point(150, 300),
    rotation: rot,
    path: path,
    fillColor: "#"+color,
    fillOpacity: getIconOpacity(bus),
    scale: 0.10,
    strokeColor: "#"+color,
    strokeWeight: 2
  };
}

function updateExistingMarker(bus){
  var myLatlng = new google.maps.LatLng(bus.lat, bus.lon);
  if(markers[bus.busid].getMap() == null){
    markers[bus.busid].setMap(map);
  }
  if(!markers[bus.busid].getPosition().equals(myLatlng)){
      markers[bus.busid].setPosition(myLatlng);
      markers[bus.busid].setAnimation(google.maps.Animation.BOUNCE);
      //Turn off the bouncing in 3 seconds...
      setTimeout(function(){
        var myMarker = markers[bus.busid];
        updateIconOpacity(bus.busid);
        myMarker.setAnimation(null);
      }, 3000);
    }else{      
      updateIconOpacity(bus);
    }
}

function getIconOpacity(bus)
{
  var busTime=parseISO8601(bus.last_update);
  var stale = staleness(busTime);
  return (1.0-stale);
}

function updateIconOpacity(bus)
{
  //Adjust transparency based on staleness
  //All bus markers are made in the makeMarker function
  //and have path, fillColor, fillOpacity, strokeColor, strokeWeight attributes
  //Fill opacity ranges from 0 (totally transparent) to 1 (fully opaque)
  //
  //We'll map the range [.1, .9] on the scale of staleness -- 10 minutes to 0 minutes
  if(bus == null){ return; }
  if(markers[bus.busid] == null){ return; }
  var marker = markers[bus.busid];
  if(marker == null){ return; }
  var icn = marker.getIcon();
  icn.fillOpacity = getIconOpacity(bus);
  marker.setIcon(icn);
}

function makeNewMarker(bus){

  var myLatlng = new google.maps.LatLng(bus.lat, bus.lon);
  var pinImage=makeMarker(bus);


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
    pollPath("/buses/"+busid+"?minimal=true", http_nonsense_wrapper(function(content_text){
      if(openinfo != null){
        openinfo.close();
      }
      var infowindow = new google.maps.InfoWindow({ content: content_text });
      infowindow.open(map,marker);
      openinfo=infowindow;
    }));
  }); 
}

function initialize() {
  show_debug("initializing...");
  navigator.geolocation.getCurrentPosition(showPosition,showError);
  startPollingBuses();

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
  // setInterval(pollBuses, 15000);
  // setInterval(pollStops, 15000);

  
}

function startPollingBuses(){
  clearInterval(pollStops);
  setInterval(pollBuses, 5000);
}

function startPollingStops(){
  clearInterval(pollBuses);
  setInterval(pollStops, 15000);
}


function showError(error)
{
  showPosition({
    coords :
    { 
      latitude: 38.89,
      longitude: -77.03 
    }
  });
} 
window.onload = initialize;




 