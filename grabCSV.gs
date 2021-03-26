function scheduled() {
  grabCSV("https://example.com/file.csv", "CSV Import", "Protected for CSV import", "Sheet1!A1");
}

/*
* url - The URL to fetch from
* sheetName - The destination sheet. Default: Last section of URL pathname.
* lockSheet - A message to protect the destination with (warning-only). Optional. Default: null (unprotected)
* timestamp - Where to place a timestamp for this import. A1 notation. Optional. Default: null
*/
function grabCSV(url, sheetName=null, lockMsg=null, timestampA1=null) {
  var response = UrlFetchApp.fetch(url);
  var status = response.getResponseCode();
  if (status >= 200 && status < 300) {
    var data = Utilities.parseCsv(response.getContentText());
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if(sheetName==null){

      let strings = url.split("/");
      let len = strings.length;
      let last = strings[len-1];
      if(last==null || last.length==0){
        last = strings[len-2];
      }
      let name = decodeURIComponent(last).replace(".csv","");
      sheetName = name;
    }
    var sheet = ss.getSheetByName(sheetName);
    if (sheet == null) {
      sheet = ss.insertSheet();
      sheet.setName(sheetName);
    }
    if (lockMsg!=null) {
      sheet.protect().setDescription(lockMsg).setWarningOnly(true);
    }

    var length = data.length;
    var width = 0;
    data.forEach(row => {
      if (row.length > width) {
        width = row.length;
      }
    });
    sheet.clear();
    sheet.getRange(1, 1, length, width).setValues(data);

    if (timestampA1 != null && ss.getRange(timestampA1) != null) {
      ss.getRange(timestampA1).setValue(new Date());
    }
  } else {
    console.error("Status: " + status);
  }
}
