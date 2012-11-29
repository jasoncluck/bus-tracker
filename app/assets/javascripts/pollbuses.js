
var request = false;

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

if (!request)
 alert("Error initializing XMLHttpRequest!");

function pollBuses(){
    var url = "/buses.json"
    request.onreadystatechange = newBusPositions
    request.open("GET", url, true);
    request.send(null);

    
}

function pollStops(){
    //stops
    var url = "/stops.json"
    request.onreadystatechange = newStopPositions
    request.open("GET", url, true);
    request.send(null);
}

function newBusPositions()
{   
    if (request.readyState == 4) {
        if(request.status == 200){
            var positionsJSON = jQuery.parseJSON(request.responseText);
            //updateMarkeres is defined in mapbuses.js
            updateBusMarkers(positionsJSON);
        }else{
            //alert("HTTP status: "+request.status);
        }
        setTimeout(pollBuses, 10000);
    }
}

function newStopPositions()
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