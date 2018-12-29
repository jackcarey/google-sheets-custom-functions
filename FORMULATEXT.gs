/**
* Return a formula as a string.
* @param {"A1"} refStr The cell reference as a string.
* @customfunction
*/
function FORMULATEXT(refStr){
  return refStr && refStr.map
  ? refStr.map(FORMULATEXT)
  : SpreadsheetApp.getActiveSpreadsheet().getRangeByName(refStr 
                                                         ? refStr
                                                         : SpreadsheetApp.getActiveRange().getA1Notation()
                                                        ).getFormulas().join("\n");
}
