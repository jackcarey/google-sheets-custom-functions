/**
* Join arrays into legible, parsable strings
* @param {array} array The array to join.
* @param {" - "} colStr String that joins columns in each row.
* @param {char(10)} rowStr String used to join each row.
* @customfunction
*/
function arrayString(array,colStr,rowStr){
  if(!array){
    throw new Error("array must be provided");
  }else{
    colStr=colStr?colStr:" - ";
    rowStr=rowStr?rowStr:"\n";
    var outputStr = "";
    for(var i in array){
      outputStr += (i>0?rowStr:"") + array[i].join(colStr);
    }
    return outputStr;
  }
}
