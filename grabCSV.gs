function scheduled() {
  grabCSV("https://example.com/file.csv", "CSV Import", true, "Sheet1!A1");
}

/*
* url - The URL to fetch from
* shettName - The destination
* lockSheet - Should the destination be protected (warning-only). Optional. Default: true
* timestamp - Where to place a timestamp for this import. A1 notation. Optional. Default: null
*/
function grabCSV(url, sheetName, lockSheet=true, timestampA1=null) {
  var response = UrlFetchApp.fetch(url);
  var status = response.getResponseCode();
  if (status >= 200 && status < 300) {
    var data = Utilities.parseCsv(response.getContentText());
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    if (sheet == null) {
      sheet = ss.insertSheet();
      sheet.setName(sheetName);
    }
    if (lockSheet) {
      sheet.protect().setDescription("Protected for CSV import").setWarningOnly(true);
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
      ss.getRange(timestampAddress).setValue(new Date());
    }
  } else {
    console.error("Status: " + status);
  }
}
