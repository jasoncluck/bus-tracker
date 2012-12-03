
var busy=false;
var pollCount=0;
var request = false;
var buses;
var stops;

function make_request(){
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
    return request;
}

request = make_request();

function pollBuses(){
    pollPath("/buses.json", http_nonsense_wrapper(newBusPositions));
}

function pollPath(path, callback){
    poll_path_request(path, callback, request);
}

function http_nonsense_wrapper(callback){
    return function(){
        if (request.readyState == 4) {
            pollCount = pollCount+1;
            var myDate = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
            var content_text = request.responseText;
            if(request.status == 200){
                show_debug("request came back good at "+myDate);
                callback(content_text);
            }else{
                show_debug("HTTP status: "+request.status+" "+request.responseText);
            }
            busy=false;
        }
    };
}

function poll_path_request(path, callback, request){    
    if(busy || request.readyState == 1 || request.readyState == 2 || request.readyState == 3)
    {
        setTimeout(function(){
            poll_path_request(path, callback, request);
        }, 500);
        show_debug("Busy, waiting 500 ms...");
        return;
    }
    busy=true;
    show_debug("polling "+path+" with callback "+callback);
    request.onreadystatechange = callback;
    request.open("GET", path, true);    
    request.send(null);
    var myDate = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
    show_debug("sent request at "+myDate+"...");
}

function pollStops(route){
    pollPath("/stops.json?route="+route, http_nonsense_wrapper(newStopMarkers));
}

function newStopMarkers(content)
{
    updateStopMarkers(jQuery.parseJSON(content));
}


function newBusPositions(content)
{            
    //updateMarkeres is defined in mapbuses.js
    buses = jQuery.parseJSON(content);
    updateBusMarkers();
}