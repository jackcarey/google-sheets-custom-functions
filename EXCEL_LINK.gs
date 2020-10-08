/**
* @OnlyCurrentDoc
*/
/**Return a link to export the current document in .xlsx format.
* @param name Optional. The name of the sheet to export. Default: All sheets.
* @customfunction
*/
function EXCEL_LINK(name){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var gid = name ? ss.getSheetByName(name).getSheetId() : null;
  var url = ss.getUrl();
  url = url.replace("/edit","/export?format=xlsx");
  if(gid!=null){
    url+= "&gid="+gid;
  }
  return url;
}
