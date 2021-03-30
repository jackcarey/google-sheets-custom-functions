/**
 * Join columns by row, optionally prefixing with the column header
 * @param {[[]]} data Your data
 * @param {","} join The character/string to join values with. Default: , (comma)
 * @param {TRUE} prefixHeaders Prefix the values of row 1 and an underscore to the value in each other row.Default: TRUE.
 * @customfunction
 */
function COLUMN_JOIN(data, char = ",", prefixHeaders = true) {
  let res = [];
  for (var i = (prefixHeaders ? 1 : 0); i < data.length; ++i) {
    let row = data[i];
    let rowStr = "";
    for (var j = 0; j < row.length; ++j) {
      var cell = row[j];
      if (cell != null && cell != "" && cell != undefined) {
        //optionally prefix the header
        rowStr += (prefixHeaders ? data[0][j] + "_" : "");
        //add the cell data
        rowStr += row[j];
        if (j < row.length) {
          rowStr += char;
        }
      }
    }
    if(rowStr.substr(-1)==char){
      rowStr = rowStr.substring(0,rowStr.length-1);
    }
    res.push(rowStr);
  }
  return res;
}

