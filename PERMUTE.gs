/**
* Return all combinations of items from the columns of the input.
* @param {[]} arr An array of data.
* @param {","} join Optional. A string to join rows with. Default: none.
* @customfunction
*/
function PERMUTE(arr,join) {
  //modififed from: https://stackoverflow.com/questions/48053567/google-spreadsheets-generate-all-combinations-of-4-columns-with-8-rows-each
  //define private functiosn
  const transpose = (matrix) => {
  let [row] = matrix;
  return row.map((value, column) => matrix.map(row => row[column]))
}
  const joinRow = (row) => {return row.join(join.toString(join));};
  
  //transpose the array to provide a combination from columns, not rows
  arr = transpose(arr);
  
  //create the permutations
  var result = arr.reduce(function(prod, row) {
    var out = [];
    for (var i=0;i<row.length;++i) {
      out = out.concat(prod.map(function(x) {
        return x.concat(row[i]);
      }));
    }
    return out;
  }, [[]]);

  //if a join character is provided, use it
  if(join?true:false){
    result = result.map(function(row) {return joinRow(row)});
  }
  return result;
}