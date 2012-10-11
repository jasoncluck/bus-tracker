function get_random_color() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}

//from http://stackoverflow.com/questions/1274743/how-can-i-determine-a-timezone-by-the-utc-offset/1274752#1274752
//@param timestamp An ISO-8601 timestamp in the form YYYY-MM-DDTHH:MM:SS±HH:MM
//Note: Some other valid ISO-8601 timestamps are not accepted by this function
function parseISO8601(timestamp)
{
  var regex = new RegExp("^([\\d]{4})-([\\d]{2})-([\\d]{2})T([\\d]{2}):([\\d]{2}):([\\d]{2})Z");
  var matches = regex.exec(timestamp);
  if(matches != null)
  {
    return new Date(
      Date.UTC(
        parseInt(matches[1], 10),
        parseInt(matches[2], 10) - 1,
        parseInt(matches[3], 10),
        parseInt(matches[4], 10),
        parseInt(matches[5], 10),
        parseInt(matches[6], 10)
      )
    );
  }
  return null;
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