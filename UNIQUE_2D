/**
* Return unique values from across a 2D range, ignoring empty cells.
* @param {[range]} range The input range.
* @param {1} sortType How results are sorted.
1 = alphanumerical (default).
2 = ascending order of frequency.
3 = descending order of frequency.
* @param {FALSE} displayCounts Include counts in the output. Default: FALSE
* @customfunction
*/
function UNIQUE_2D(range,sortType,displayCounts) {
  if(range){
    var obj = {};
    for(var i=0;i<range.length;++i){
      for(var j=0;j<range[0].length;++j){
        var val = range[i][j].toString();
        var keys = Object.keys(obj);
        if(val!=undefined && val!=null && val!=""){
          //if the item is not in the output
          if(keys.indexOf(val)==-1){
            //add it
            obj[val] = 1;
          }else{
            //if the item is already in the output add 1 to its count
            obj[val]+=1;
          }
      }
      }
    }
    var array = [];
    for(var k=0;k<keys.length;++k){
      var key = keys[k];
      array.push([key,obj[key]]);
    }
    
    //default sort = alphanumerical
    array.sort();
    
    if(sortType==2 || sortType==3){
      array.sort(function(a, b) {
        return sortType==2 ? a[1] - b[1] : b[1] - a[1];
      });      
    }
    
    displayCounts = displayCounts || false;
    if(!displayCounts){
      for(var l=0;l<array.length;++l){
        array[l] = array[l][0];
      }
    }    
    return array;
  }
}
