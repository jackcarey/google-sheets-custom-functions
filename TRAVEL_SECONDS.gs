/**
 * @OnlyCurrentDoc Limits the script to only accessing the current sheet.
 */
/**
 * A custom function that gets the travel time between two addresses in seconds.
 *
 * @param {String} origin The starting address.
 * @param {String} destination The ending address.
 * @Param {String} mode driving,walking,bicycling, or transit. Default: driving.
 * @return {Number} A string for the driving duration
 * @customfunction
 */
function travel_seconds(origin,destination,mode="driving"){
  var modes = ["driving","walking","bicycling","transit"];
  if(modes.indexOf(mode.toLowerCase())==-1){
    throw new Error("Mode must be one of "+modes.sort().join());
  }
  origin = origin?origin:destination;
  destination=destination?destination:origin;
  var props = PropertiesService.getDocumentProperties(),
      cache = CacheService.getDocumentCache(),
      key = origin+destination+"_"+mode+"_seconds";
  var cached = cache.get(key);
  var stored =  cached ? cached : props.getProperty(key);
  if(stored){
    if(!cached){
      cache.put(key, stored);
    }
    return stored;
  }else{
  var directions = getDirections_(origin, destination,mode);
      var seconds = null;
    if(directions && directions.routes){
  var legs = directions.routes[0].legs;
    for(var i=0;i<legs.length;i++){
      seconds += legs[i].duration.value;
    }
    try{
      cache.put(key, seconds);
    props.setProperty(key,seconds);
    }catch(e){}
    }
  return seconds;
  }
}

/**
 * A shared helper function used to obtain the full set of directions
 * information between two addresses. Uses the Apps Script Maps Service.
 *
 * @param {String} origin The starting address.
 * @param {String} destination The ending address.
 * @param {String} mode The travel mode. Default: 'walking'
 * @return {Object} The directions response object.
 */
function getDirections_(origin, destination, mode) {
  var directionFinder = Maps.newDirectionFinder().setMode(mode?mode.toString().toLowerCase():"walking");
  directionFinder.setOrigin(origin);
  directionFinder.setDestination(destination);
  var directions = directionFinder.getDirections();
  if(!directions || directions.error_message=="ZERO_RESULTS"){
    throw new Error("No results");
  }
  if (directions.status !== 'OK') {
    throw new Error(directions.error_message||directions.status);
  }
  return directions;
}
