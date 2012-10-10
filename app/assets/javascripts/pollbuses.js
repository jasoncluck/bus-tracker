
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

function poll(){
    var url = "/buses.json"
    request.onreadystatechange = newpositions;
    request.open("GET", url, true);
    request.send(null);
}

function newpositions()
{
    if (request.readyState == 4) {
        if(request.status == 200){
            var positionsJSON = jQuery.parseJSON(request.responseText);
            //updateMarkeres is defined in mapbuses.js
            updateMarkers(positionsJSON);
        }else{
            //alert("HTTP status: "+request.status);
        }
        setTimeout(poll, 10000);
    }
}