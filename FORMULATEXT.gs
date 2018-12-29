/**
* Return a formula as a string.
* @param {"A1"} refStr The cell reference as a string.
* @customfunction
*/
function FORMULATEXT(refStr) {
  if(refStr && refStr.map){
    return refStr.map(FORMULATEXT);
  }else{
    refStr = refStr ? refStr : SpreadsheetApp.getActiveRange().getA1Notation();
    return SpreadsheetApp.getActiveSpreadsheet().getRangeByName(refStr).getFormulas().join("");
  }
}
