/**
* Return a random number between 1 and 0, or between a range.
* @param {10} max The maximum value. Optional.
* @param {0} min The minimum value. If max is provided, default is 0.
* @customfunction
*/
function RANDOM(max,min){
  //if there is a minimum, but no maximum, swap the values.
  if(min && !max){
    max = min;
    min = 0;
  }
  if(max){
    min = min ? Math.ceil(min) : 0;
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
  }else{
    return Math.random();
  }
}