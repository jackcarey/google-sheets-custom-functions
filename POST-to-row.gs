// Deploying a script as a web app: https://developers.google.com/apps-script/guides/web#deploy_a_script_as_a_web_app

/**
 * @OnlyCurrentDoc
 */

/**
 * Turn a column number into letters
 */
function columnToLetter(column) {
  var temp, letter = '';
  while (column > 0) {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}

/**
 * Turn column letters into a number
 */
function letterToColumn(letter) {
  var column = 0, length = letter.length;
  for (var i = 0; i < length; i++) {
    column += (letter.charCodeAt(i) - 64) * Math.pow(26, length - i - 1);
  }
  return column;
}

/**
 * When a POST request is made to this Web App endpoint, add the passed object to the named sheet as a new row.
 * Assumes headings are in row 1.
 */
const sheetName = "Sheet1";

const doPost = (event = {}) => {
  const { parameter } = event;
  parameter.doPostTimestamp = new Date();
  let resultObj = { status: 200, statusText: "OK" };
  try {
    //if a sheet with this name doesn't exist, it'll be created
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName) || SpreadsheetApp.getActiveSpreadsheet().insertSheet();
    //ensure the sheet has the correct name, incase it was newly added
    sheet.setName(sheetName);
    //ensure each key exists in the headings row
    const headings = sheet.getRange("1:1").getValues();
    //ensure each key from the passed object has a heading for a coulmnn it'll go into
    const keys = Object.keys(parameter).sort();
    keys.forEach(key => {
      if (!headings.includes(key)) {
        headings.push(key);
      }
    });
    headings.forEach((heading, idx) => {
      sheet.getRange(1, idx + 1).setValue(heading);
    });

    let lastRowNum = sheet.getLastRow()+1;
    keys.forEach(key => {
      let idx = headings.indexOf(key);
      if (idx != -1) {
        sheet.getRange(lastRowNum, idx + 1).setValue(parameter[key]);
      }
    })
    resultObj.message = "Row added";

  } catch (e) {
    resultObj = e;
    resultObj.status = 500;
    let msg = e && e.message ? e.message : null || "Error";
    let lineNo = e && e.lineNumber ? e.lineNumber : "unknown";
    resultObj.statusText = `Line ${lineNo}: ${msg}`;
    resultObj.object = parameter;
  }
  return ContentService.createTextOutput(JSON.stringify(resultObj)).setMimeType(ContentService.MimeType.JSON);
};
