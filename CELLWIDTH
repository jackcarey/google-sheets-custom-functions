/**
 * Find the width of a cell in pixels.
 *
 * @param rangeStr The range as a string.
 * @customfunction
 */
function CELLWIDTH(rangestr){
  var ss= SpreadsheetApp.getActiveSpreadsheet();
  var range = rangestr ? ss.getRangeByName(rangestr) : ss.getActiveCell();
return range.getSheet().getColumnWidth(range.getColumn());
}
