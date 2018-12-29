/**
* Return a formula as a string.
* @param {"A1"} refStr The cell reference as a string.
* @customfunction
*/
function FORMULATEXT(refStr) {
  if(!refStr){throw new Error("A reference must be provided.");}
  if(refStr.map){
    return refStr.map(FORMULATEXT);
  }else{
    return SpreadsheetApp.getActiveSpreadsheet().getRangeByName(refStr).getFormulas().join("\n");
  }
}
