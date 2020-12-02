/**
* Return an array of fizzbuzz results
* @param {1} start The number to start on.
* @param {100} end The number to end on.
* @param {array} table Two-column array of multiples. Defaults on standard 3=fizz,5=buzz.
* @customfunction
*/
function FIZZBUZZ(start,end,table){
  start = start&&!isNaN(start)?start:1;
  end = end&&!isNaN(end)?end-start >50000 ? 50000: end : start+100;
  var array = [],
      multiples = table || [[3,"fizz"],[5,"buzz"]];
  for(var i = Math.min(start,end);i<=Math.max(start,end);i++){
    var cellStr = "";
    for(var j in multiples){
      if(!isNaN(multiples[j][0]) && i % multiples[j][0]==0){
        cellStr+=multiples[j][1]
      }
    }
    array.push(cellStr==""?i:cellStr);
  }
  return start<=end ? array : array.reverse();
}
