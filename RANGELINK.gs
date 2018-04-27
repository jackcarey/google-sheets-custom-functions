    /**
    *Returns a URL for a range.
    *@param input - The range rangeA1Notation.
    *@customfunction
    */
    function RANGELINK(rangeStr){      
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var range = rangeStr ? ss.getRangeByName(rangeStr) : ss.getActiveCell();
      var gid = range.getSheet().getSheetId();
      var cell = range.getA1Notation();
      return ss.getUrl()+"#gid="+gid+"&range="+cell;
    }
