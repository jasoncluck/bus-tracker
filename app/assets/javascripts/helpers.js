function get_random_color() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}

function show_debug(msg){
  $("#navbar_right").text(msg);
}

//from http://stackoverflow.com/questions/1274743/how-can-i-determine-a-timezone-by-the-utc-offset/1274752#1274752
//@param timestamp An ISO-8601 timestamp in the form YYYY-MM-DDTHH:MM:SS±HH:MM
//Note: Some other valid ISO-8601 timestamps are not accepted by this function
function parseISO8601(timestamp)
{
  return new Date(timestamp);
}

//Returns true if the date is stale
//Stale is anything older than 2 minutes...
function isStale(date){
	if(date == null){
		return true;
	}
	var now = Date.now();
  var staleness = (now-date)/1000;
	return staleness > 120;
}

/*
* Returns the staleness, with 1 being super stale and 0 being super fresh
*/
function staleness(date)
{
  var now = Date.now();
  var staleness_secs = (now-date)/1000;
  var max_stale = 5 * 60; //5 minutes in seconds
  if(staleness_secs > max_stale){
    return 1.0;
  }
  return (staleness_secs / max_stale);
}

//Returns true if the date is stale
//Stale is anything older than 30 minutes...
function isAncient(date){
  if(date == null){
    return true;
  }
  var now = Date.now();
  var staleness = (now-date)/1000;
  return staleness > 60*60;
}