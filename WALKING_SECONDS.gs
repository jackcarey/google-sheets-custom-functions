/**
 * A custom function that gets the walking time between two addresses in seconds.
 *
 * @param {String} origin The starting address.
 * @param {String} destination The ending address.
 * @return {Number} A string for the walking duration
 */
function WALKING_SECONDS(origin, destination) {
  origin = origin?origin:destination;
  destination=destination?destination:origin;
  var props = PropertiesService.getDocumentProperties(),
      key = origin+destination+"WALKING_SECONDS";
  var stored = props.getProperty(key);
  if(stored){
    return stored;
  }else{
  var directions = getDirections_(origin, destination),
      legs = directions.routes[0].legs;
  var walkSeconds = 0;
    for(var i=0;i<legs.length;i++){
      walkSeconds += legs[i].duration.value;
    }
    try{
    props.setProperty(key,walkSeconds);
    }catch(e){}
  return walkSeconds;
  }
}
