/**
* A version of PERIODIC_AMOUNTS for arrays. array columns: val,freq,start,end,data_1,data_2
* @customfunction
*/
function PERIODIC_AMOUNTS_ARRAY(array){
  var retArr = [];
  for(var i =0;i<array.length;i++){
    var val = array[i][0],
        freq = array[i][1],
        start = array[i][2],
        end = array[i][3],
        data_1 = array[i][4],
        data_2 = array[i][5];
    try{
      if(val){
       var periodic_array = PERIODIC_AMOUNTS(val,freq,start,end,data_1,data_2);
        if(retArr.length==0){
          retArr = periodic_array;
        }else{
        for(var j = 0;j<periodic_array.length;j++){
          retArr.push(periodic_array[j]);
        }
                      }
      }
    }catch(e){}
  }
  return retArr;
}

/**
* Return dates that an amount would appear over a given period.
* @param {1} value How long the amount takes to repeat.
* @param {"days"} freq How often the amount is repeated: days,weeks,months,years.
* @param {1/1/19} start The start date for the period.
* @param {12/31/19} end The end date for the period.
* @param {"General"} data_1 Optional. A piece of data to append to each row.
* @param {10} data_2 Optional. A piece of data to append to each row.
* @customfunction
*/
function PERIODIC_AMOUNTS(value,freq,start,end,data_1,data_2){
  var lock = LockService.getDocumentLock();
  try{
    lock.waitLock(60000);
  }catch(e){throw new Error("busy")}
  try{
  //basic sanitation of input parameters
  value = value && !isNaN(value) ? Math.max(1,Math.round(value)) : 1;
  freq = freq ? freq.toLowerCase() : "days";
  start = start ? start : new Date();
  end = end ? end : start;
  start = new Date(Math.min(start,end));
  end = new Date(Math.max(start,end));
  var freqs = ["days","weeks","months","years"].sort();
  
  //error checking
  if(freqs.indexOf(freq.toLowerCase())==-1){
    throw new Error("freq must be one of "+freqs.join(","));
  }

  //check cache for a value;
  var key = [value,freq,start,end,data_1,data_2].join("|"),
      cache = CacheService.getDocumentCache(),
      stored = cache.get(key) ? cache.get(key) : PropertiesService.getDocumentProperties().getProperty(key);
  if(stored?true:false){
    var retArr = JSON.parse(stored);
    for(var i = 0;i<retArr.length;i++){
      retArr[i][0] = new Date(retArr[i][0]);
    }
    return retArr;
  }else{      
  //calculate days and push to array where frequency matches
  var newDate = new Date(start),
      row = [newDate];
    if(data_1){row.push(data_1)}
    if(data_2){row.push(data_2)}
  var retArr = [row];
  while(newDate<end){
    var oldDate = new Date(newDate);
    switch(freq){
      case "days":
        newDate = oldDate.setDate(oldDate.getDate()+value);
        break;
      case "weeks":
        newDate = oldDate.setDate(oldDate.getDate()+value*7);
        break;
      case "months":
        var startDoM = start.getDate();
        oldDate.setDate(Math.min(28,startDoM));        
        newDate = new Date(oldDate.setMonth(oldDate.getMonth()+value));
        dateLoop:
        while(newDate.getDate()<startDoM){
          var temp = new Date(newDate);
          temp.setDate(newDate.getDate()+1);
          //console.log(temp);
          if(temp.getMonth() == newDate.getMonth() && temp.getYear() == newDate.getYear()){
            newDate = new Date(temp);
          }else{
            break dateLoop;
          }
        }
        break;
      case "years":
        newDate = oldDate.setYear(oldDate.getYear()+value);
        break;
      default: //do nothing
        break;
    }
    newDate = new Date(newDate);
    var row = [newDate];
    if(data_1){row.push(data_1)}
    if(data_2){row.push(data_2)}
    if(newDate==start?true:newDate!=oldDate && newDate<=end){
      retArr.push(row);
    }
  }
  //return value
    SpreadsheetApp.flush();
    lock.releaseLock();
  if(retArr.length>=1){
    if(!stored){  //cache the new array
      try{cache.put(key, JSON.stringify(retArr),21600)}catch(e){} //do nothing if retArr cannot be cached
    }
    return retArr;
  }else{
    throw new Error("no data to return")
  }
  }
}catch(error){
  throw new Error(error.message+" (line "+error.lineNumber+")");
}
}
