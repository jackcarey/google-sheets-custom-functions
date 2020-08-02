/** EXAMPLE

Data:

ANIMAL | BREED | COLOR | NAMES
Dog | Daschund | Black | Milo,Deano,Bella,Buddy

Formula:

=SEPARATE(data, "NAMES", ",")

Result:

ANIMAL | BREED | COLOR | NAMES
Dog | Daschund | Black | Milo
Dog | Daschund | Black | Deano
Dog | Daschund | Black | Bella
Dog | Daschund | Black | Buddy

*/

/**
* Split up concatenated data in a column by duplicating rows.
* @param {[]} data 2D array of data to separate. Required.
* @param {12} column If number, column number to check. If string, will find column number automatically based on row 1. Default: 1.
* @param {" "} splitBy The character/string to split the column by. Default: comma (,).
* @customfunction
*/
function SEPARATE(data,column,splitBy) {
  if(!data) throw new Error("data is required");
  var hasHeader = false;
  var output = [];
  splitBy = splitBy || ",";
  if(isNaN(column) && data[0].indexOf(column)>-1){ //try to find the column name in the header row
    hasHeader = true;
    column = data[0].indexOf(column);
  }else{
    column = !isNaN(column) && column>0 ? (column-1) : 0; //take 1 to make the column 0 indexed.
  }
  for(var i=(hasHeader?1:0);i<data.length;++i){
    var originalRow = data[i];
    var outputRow = data[i].slice();
    var columnCell = originalRow[column];
    var cellArray = columnCell.split(splitBy);
    for(var j=0;j<cellArray.length;++j){
      var thisRow = outputRow.slice();
      thisRow[column] = cellArray[j];
      output.push(thisRow);
    }
  }
  return output;
}
