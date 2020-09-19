function onInstall(e){onOpen(e);}
function onOpen(e){
createMenu();
}

function createMenu(){
  SpreadsheetApp.getUi().createAddonMenu().addItem("exportFiles()","exportFiles").addToUi();
}

function exportFiles(){
  filesToDrive("Files!A1:C10","LevelOne/LevelTwo",["Product","Colour"],"File");
}

function filesToDrive(rangeName,parentPath,pathHeadings,URLHeading) {
  //check all inputs exist
  if(!rangeName || !pathHeadings || !URLHeading) throw new Error("missing required parameter");
  //set up document
  var ss = SpreadsheetApp.getActiveSpreadsheet(),
      range = ss.getRangeByName(rangeName),
      values = range.getValues();
  var headings = values[0];
  //check headings exist for URL and all paths and create reference object for column numbers
  var URLCol = headings.indexOf(URLHeading);
  var headingObj = {};
  if(URLCol<0) throw new Error("'"+URLHeading+ "' not found in row 1 of '"+rangeName+"'");
  for(var i=0;i<pathHeadings.length;++i){
    var heading = pathHeadings[i];
    var headingCol = headings.indexOf(heading);
    if(headingCol>-1){
      headingObj[heading] = headingCol;
    }else{
      throw new Error("'"+heading+ "' not found in row 1 of '"+rangeName+"'");
    }
  }
  //now loop through all rows of data, skipping the headings
  for(var i=1;i<values.length;++i){
    var row = values[i];
    var url = row[URLCol];
    if(url){
    //navigate to the destination folder
    var fullPath = parentPath + (parentPath.slice(-1)=="/"?"":"/");
    for(var j=0;j<pathHeadings.length;++j){
      var heading = pathHeadings[j];
      var col = headingObj[heading];
      var rowVal = row[col];
      fullPath += (rowVal?rowVal:"No "+heading)+"/";
    }
      var destinationFolder = getCreateDriveFolderFromPath(fullPath);
      var blob = UrlFetchApp.fetch(url).getBlob();
      var fileName = blob.getName();
      //in the last folder, delete all existing files with the same name
      var files = destinationFolder.getFilesByName(fileName);
      while (files.hasNext()) {
        var file = files.next();
        file.setTrashed(true);
      }
      //then create a new file with the data we just fetched
      destinationFolder.createFile(blob);
    }
  }
}

/**
 * Returns a DriveApp folder object corresponding to the given path.
*/
  function getCreateDriveFolderFromPath(fullPath){
  return (fullPath || "/").split("/").reduce ( function(prev,current) {
    if (prev && current) { //if folder exists for path, go inside to the next level and repeat
      var fldrs = prev.getFoldersByName(current);
      return fldrs.hasNext() ? fldrs.next() : prev.createFolder(current);
    }
    else {      //if not then create folder at this path
      return current ? null : prev;
    }
  },DriveApp.getRootFolder()); //start at root of drive
    }
