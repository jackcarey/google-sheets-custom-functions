/**
* Return unique values from across a 2D range.
* @param {[range]} range The input range.
* @customfunction
*/
function UNIQUE_2D(range){
  if(!range) return;
  var oneD = [];
  //flatten the 2D array to 1D
  for(var i=0;i<range.length;++i){
    for(var j=0;j<range[i].length;++j){
      oneD.push(range[i][j]);
    }
  }
  //filter and return the unique values
  return oneD.filter(function (value, index, self) { 
    return self.indexOf(value) === index;
  });
}