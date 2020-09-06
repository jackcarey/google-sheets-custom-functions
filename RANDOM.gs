/**
* Return a random number between 1 and 0, or between a range.
* @param {0} min The minimum value.
* @param {10} max The maximum value.
* @customfunction
*/
function RANDOM(min,max){
  if(!min) min=0;
  if(min && !max){
    max = min;
    min=0;
  }
  if(max){
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
  }else{
    return Math.random();
  }
}