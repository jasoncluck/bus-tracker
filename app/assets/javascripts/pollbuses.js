
var busy=false;
var pollCount=0;
var request = false;
var buses;
var stops;

try {
 request = new XMLHttpRequest();
} catch (trymicrosoft) {
 try {
   request = new ActiveXObject("Msxml2.XMLHTTP");
 } catch (othermicrosoft) {
   try {
     request = new ActiveXObject("Microsoft.XMLHTTP");
   } catch (failed) {
     request = false;
   }  
 }
}

if (!request){
    alert("Error initializing XMLHttpRequest!");
}

function pollBuses(){
    pollPath("/buses.json", newBusPositions);
}

function pollPath(path, callback){
    request.onreadystatechange = callback;
    request.open("GET", path, true);
    request.send(null);
    busy=true;
    var myDate = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
    show_debug("sent request at "+myDate+"...");
}

function pollStops(route){
    pollPath("/stops.json?route="+route, newStopPositions);
}

function newBusPositions()
{
    if (request.readyState == 4) {
        busy=false;
        pollCount = pollCount+1;
        var myDate = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");

        if(request.status == 200){
            show_debug("request came back good at "+myDate);
            var positionsJSON = jQuery.parseJSON(request.responseText);
            //updateMarkeres is defined in mapbuses.js
            buses=positionsJSON;
            updateBusMarkers()
        }else{
            show_debug("HTTP status: "+request.status);
        }
    }
}function newStopPositions()
{   
    if (request.readyState == 4) {
        if(request.status == 200){
            var positionsJSON = jQuery.parseJSON(request.responseText);
            //updateMarkeres is defined in mapBuses.js
            updateStopMarkers(positionsJSON);
        }else{
            //alert("HTTP status: "+request.status);
        }
        setTimeout(pollStops, 10000);
    }
}