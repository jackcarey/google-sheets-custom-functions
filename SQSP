/check if the user has passed a valid type to the SQSP functions and return the object associated with it.
function _validate_type(type){
  var types = {
    "inventory":{"version":"1.0",
                 "returnKey":"inventory"},
    "orders":{"version":"1.0",
              "returnKey":"result"},
    "transactions":{"version":"1.0"},
    "products":{"version":"1.0","returnKey":"products"}
  };
  if(type && Object.keys(types).indexOf(type)==-1){
    throw new Error("type must be one of "+Object.keys(types).sort().join(", "));
  }else{
    return types[type];
  }  
}

/* Return info from Squarespace
* @param {"12345..."} key Your API key.
* @param {6} age The age of results in hours. 1-6. Default: 1.
* @param {"orders"} type 'inventory', 'orders' 'transactions' or 'products'. Default: orders.
* @param {TRUE} includeTimestamp Should the timestamp of when data was fetch be included in the results. Default: TRUE.
* @customfunction
*/
function SQSP(key,age,type,includeTimestamp=true){
  if(!key) throw new Error("key is required");
  age = !isNaN(age) && age>0 && age<=6 ? age : 1;
  var type = (type.toLowerCase())|| "orders";
  var typeObj = _validate_type(type);
  var api =typeObj && typeObj.version ? typeObj.version : "1.0";
  var url = `https://api.squarespace.com/${api}/commerce/${type}`;
  var returnKey = typeObj && typeObj.returnKey ? typeObj.returnKey : type;
  var headers = {
    "Authorization":" Bearer "+key,
    "User-Agent":"SQSP to G Sheets. https://www.github.com/jackcarey"
  };
  var fetchOptions = {
    'method' : 'get',
    'contentType': 'application/json',
    'headers': headers
  };
  var storeKey = key+"-"+type;
  var response = makeRequest(url,fetchOptions,storeKey,age,CacheService.getDocumentCache(),PropertiesService.getDocumentProperties(),10,true);
  var query = "";
  var parseOptions = "";
 
  var output = response[returnKey];
  if(includeTimestamp){
    for(var i=0;i<output.length;++i){
      output[i]["fetch_timestamp"] = response["storedDate"];
    }
  }
 
  //Parameters: parseJSONObject_(object, query, options, includeFunc, transformFunc)
  return parseJSONObject_(output,query,parseOptions,includeXPath_, defaultTransform_);
}

/*====================================================================================================================================*
 Helper Functions
  *====================================================================================================================================*/

/**
* Cache web requests github.com/jackcarey
*/
function makeRequest(url,options,storeKey,age,cache,dProp,lockSecs,returnDate=true){
  var now = new Date();
    var cachedString = null,
        stringToUse = null;
  var storeKey = (storeKey || (url+options?JSON.stringify(options):"")).substr(0,500);
  var allProps = dProp.getProperties();
   if(age >= 0){
    try{
      var cachedString = cache.get(storeKey);
    }catch(e){}
     if(cachedString ? true : false){
      stringToUse = cachedString;
    }else{
      try{
        stringToUse = allProps ? allProps[storeKey] : null;
        if(stringToUse ? true : false){
          try{
            cache.put(storeKey, stringToUse, 21600);
          }catch(e){}//key or value cannot be stored
        }
      }catch(e){
        throw new Error(e.message);
      }
    }
   }
    var storedObject = stringToUse ? JSON.parse(stringToUse) : null;
    var storedDate = storedObject ? Date.parse(storedObject.date) : null;
    var storedResults = storedObject ? storedObject.results : null;
    var oldDate = new Date(new Date()-(age/24*86400*1000)); //age (hours) in milliseconds
    var fromStore = false;
      if(storedResults != null && storedResults.length > 0 && storedObject.type=="results" && age>=0 && (storedDate >= oldDate || age==0)){ //if age is 0 always return stored results, otherwise check age. If age < 0 then ignore cached/stored results completely.
      var fromStore = true;
      var stringToParse = JSON.stringify(storedResults);
    }else{    
      var lock = null;
      try{
        lock = LockService.getDocumentLock();
      }catch(e){}
        if(!isNaN(lockSecs)){
    try{
      if(lock){
      lock.waitLock((lockSecs>=1?lockSecs:1)*1000);
      }
    }catch(e){
      throw new Error("connection busy");
    }
  }
      console.log("FETCHED URL: %s",url);
      var response = UrlFetchApp.fetch(url, options || {"muteHttpExceptions" : false});
      var content = {};
      if(response.getResponseCode()>=200 && response.getResponseCode()<300){
      var content = JSON.parse(response.getContentText());
        var stringToParse = JSON.stringify(content);
                        if(!isNaN(lockSecs) && lock!=null){
    lock.releaseLock();
  }
      }else{
        var errMsg = response.getResponseCode() + " " + JSON.parse(response.getContentText()).message + " | "+url + " | " + JSON.stringify(options);
        Logger.log("Error: %s",errMsg);
        throw new Error(errMsg);
      }
    }

  var jsonObj = stringToParse ? JSON.parse(stringToParse).content ? JSON.parse(stringToParse).content : JSON.parse(stringToParse) : null;

    if(!fromStore && age >= 0 && jsonObj != null){ //if the results have been returned from a store or age <= 0, don't try to store them again
     var storeResultsStr = JSON.stringify({
            date:now,
       type: "results",
            results: jsonObj
          });
        try{
          cache.put(storeKey, storeResultsStr,21600); //try storing array first, since it is easier to recall
        }catch(e){}
        try{
          dProp.setProperty(storeKey, storeResultsStr); //try storing array first, since it is easier to recall
        }catch(e){}
    }
  if(returnDate && storedDate){
    jsonObj["storedDate"] = storedDate;
  }
    return jsonObj;
  }

    //github.com/jackcarey
    /*
* Update and return data from cache and proerty store effeciently.
* obj - if update = true, then key/pair values will be updated in cache and properties
      - if update =false, then store will be search for keys. values passed will be returned when stored == null
      - special case: string 'ALL' returns all values in prop store
* update - bool. should store be updated with passed values
* props - required. property store to use. document, user, script
* cache - optional. cache to use. document, user, script
* secs - number of seconds to cache data for
* lock - optional. lock to use. document,user,script
*/
function store(obj,update,props,cache,secs,lock){
 
  function tryParse(obj){
var keys = Object.keys(obj);
    for(var i = 0;i<keys.length;i++){
     
          try{
     
      var val = obj[keys[i]];
     try{
      val = JSON.parse(obj[keys[i]]);
    }catch(e){}
      obj[keys[i]] = val;
     
          }catch(err){
      throw new Error("TP"+i);
    }
     
     
    }
    return obj;  
  }
 
  secs = secs && !isNaN(secs) ? Math.max(1,Math.min(21600,secs)) : 21600;
  if(lock!=null && lock!=undefined && lock!="" && lock !=false){
    var success = lock.tryLock(secs); //lock.waitLock(secs);
  }
  if(obj=="ALL"){
    var stored = props.getProperties();
    update==false;
    if(cache){
      CacheService.getDocumentCache().putAll(stored,secs);
    }
   
          if(lock!=null && lock!=undefined && lock!="" && lock !=false){
                      try{
            if(lock.hasLock()){
          lock.releaseLock();
            }
          }catch(e){}
      }
    return tryParse(stored);
   
  }else if(obj && typeof obj=="object"){
    update = update && ( (!isNaN(update) && update>=1) || update==true ) ? true : false;
    if(update){
      var allProps = props.getProperties(),
          updatedKeys = Object.keys(obj);
      for(var i in updatedKeys){
        var nKey = updatedKeys[i];
        allProps[nKey] = JSON.stringify(obj[nKey]);
      }
      if(cache){
      cache.putAll(allProps,secs);
      }
      props.setProperties(allProps,false);
     
      if(lock!=null && lock!=undefined && lock!="" && lock !=false){
                  try{
            if(lock.hasLock()){
          lock.releaseLock();
            }
          }catch(e){}
      }
     
      return tryParse(obj);
     
    }else{
      var rKeys = obj ? Object.keys(obj) : [];
      var cached = cache ? cache.getAll(rKeys) : {};
      if(Object.keys(cached).sort().join() == Object.keys(rKeys).sort().join()){
        if(lock!=null && lock!=undefined && lock!="" && lock !=false){
                    try{
            if(lock.hasLock()){
          lock.releaseLock();
            }
          }catch(e){}
        }
        return cached;
      }else{
        var allProps = props.getProperties();
        if(cache){
        cache.putAll(allProps,secs);
        }
        for(var j in rKeys){
          var key = rKeys[j];
          obj[key] = allProps[key]!=null ? allProps[key] : obj[key];
        }
       
        if(lock!=null && lock!=undefined && lock!="" && lock !=false){
          try{
            if(lock.hasLock()){
          lock.releaseLock();
            }
          }catch(e){}
        }
        return tryParse(obj);
       
      }
    }
  }else{
    throw new Error("object must be defined with type object");
  }
}

//bradjasper/IMPORTJSON
/**
 * Parses a JSON object and returns a two-dimensional array containing the data of that object.
 */
function parseJSONObject_(object, query, options, includeFunc, transformFunc) {
  var headers = new Array();
  var data    = new Array();
 
  if (query && !Array.isArray(query) && query.toString().indexOf(",") != -1) {
    query = query.toString().split(",");
  }

  // Prepopulate the headers to lock in their order
  if (hasOption_(options, "allHeaders") && Array.isArray(query))
  {
    for (var i = 0; i < query.length; i++)
    {
      headers[query[i]] = Object.keys(headers).length;
    }
  }
 
  if (options) {
    options = options.toString().split(",");
  }
   
  parseData_(headers, data, "", {rowIndex: 1}, object, query, options, includeFunc);
  parseHeaders_(headers, data);
  transformData_(data, options, transformFunc);
 
  return hasOption_(options, "noHeaders") ? (data.length > 1 ? data.slice(1) : new Array()) : data;
}

/**
 * Parses the data contained within the given value and inserts it into the data two-dimensional array starting at the rowIndex.
 * If the data is to be inserted into a new column, a new header is added to the headers array. The value can be an object,
 * array or scalar value.
 *
 * If the value is an object, it's properties are iterated through and passed back into this function with the name of each
 * property extending the path. For instance, if the object contains the property "entry" and the path passed in was "/feed",
 * this function is called with the value of the entry property and the path "/feed/entry".
 *
 * If the value is an array containing other arrays or objects, each element in the array is passed into this function with
 * the rowIndex incremeneted for each element.
 *
 * If the value is an array containing only scalar values, those values are joined together and inserted into the data array as
 * a single value.
 *
 * If the value is a scalar, the value is inserted directly into the data array.
 */
function parseData_(headers, data, path, state, value, query, options, includeFunc) {
  var dataInserted = false;

  if (Array.isArray(value) && isObjectArray_(value)) {
    for (var i = 0; i < value.length; i++) {
      if (parseData_(headers, data, path, state, value[i], query, options, includeFunc)) {
        dataInserted = true;

        if (data[state.rowIndex]) {
          state.rowIndex++;
        }
      }
    }
  } else if (isObject_(value)) {
    for (key in value) {
      if (parseData_(headers, data, path + "/" + key, state, value[key], query, options, includeFunc)) {
        dataInserted = true;
      }
    }
  } else if (!includeFunc || includeFunc(query, path, options)) {
    // Handle arrays containing only scalar values
    if (Array.isArray(value)) {
      value = value.join();
    }
   
    // Insert new row if one doesn't already exist
    if (!data[state.rowIndex]) {
      data[state.rowIndex] = new Array();
    }
   
    // Add a new header if one doesn't exist
    if (!headers[path] && headers[path] != 0) {
      headers[path] = Object.keys(headers).length;
    }
   
    // Insert the data
    data[state.rowIndex][headers[path]] = value;
    dataInserted = true;
  }
 
  return dataInserted;
}

/**
 * Parses the headers array and inserts it into the first row of the data array.
 */
function parseHeaders_(headers, data) {
  data[0] = new Array();

  for (key in headers) {
    data[0][headers[key]] = key;
  }
}

/**
 * Applies the transform function for each element in the data array, going through each column of each row.
 */
function transformData_(data, options, transformFunc) {
  for (var i = 0; i < data.length; i++) {
    for (var j = 0; j < data[0].length; j++) {
      transformFunc(data, i, j, options);
    }
  }
}

/**
 * Returns true if the given test value is an object; false otherwise.
 */
function isObject_(test) {
  return Object.prototype.toString.call(test) === '[object Object]';
}

/**
 * Returns true if the given test value is an array containing at least one object; false otherwise.
 */
function isObjectArray_(test) {
  for (var i = 0; i < test.length; i++) {
    if (isObject_(test[i])) {
      return true;
    }
  }  

  return false;
}

/**
 * Returns true if the given query applies to the given path.
 */
function includeXPath_(query, path, options) {
  if (!query) {
    return true;
  } else if (Array.isArray(query)) {
    for (var i = 0; i < query.length; i++) {
      if (applyXPathRule_(query[i], path, options)) {
        return true;
      }
    }  
  } else {
    return applyXPathRule_(query, path, options);
  }
 
  return false;
};

/**
 * Returns true if the rule applies to the given path.
 */
function applyXPathRule_(rule, path, options) {
  return path.indexOf(rule) == 0;
}

/**
 * By default, this function transforms the value at the given row & column so it looks more like a normal data import. Specifically:
 *
 *   - Data from parent JSON elements gets inherited to their child elements, so rows representing child elements contain the values
 *     of the rows representing their parent elements.
 *   - Values longer than 256 characters get truncated.
 *   - Values in row 0 (headers) have slashes converted to spaces, common prefixes removed and the resulting text converted to title
*      case.
 *
 * To change this behavior, pass in one of these values in the options parameter:
 *
 *    noInherit:     Don't inherit values from parent elements
 *    noTruncate:    Don't truncate values
 *    rawHeaders:    Don't prettify headers
 *    debugLocation: Prepend each value with the row & column it belongs in
 */
function defaultTransform_(data, row, column, options) {
  if (data[row][column] == null) {
    if (row < 2 || hasOption_(options, "noInherit")) {
      data[row][column] = "";
    } else {
      data[row][column] = data[row-1][column];
    }
  }

  if (!hasOption_(options, "rawHeaders") && row == 0) {
    if (column == 0 && data[row].length > 1) {
      removeCommonPrefixes_(data, row);  
    }
   
    data[row][column] = toTitleCase_(data[row][column].toString().replace(/[\/\_]/g, " "));
  }
 
  if (!hasOption_(options, "noTruncate") && data[row][column]) {
    data[row][column] = data[row][column].toString().substr(0, 256);
  }

  if (hasOption_(options, "debugLocation")) {
    data[row][column] = "[" + row + "," + column + "]" + data[row][column];
  }
}

/**
 * If all the values in the given row share the same prefix, remove that prefix.
 */
function removeCommonPrefixes_(data, row) {
  var matchIndex = data[row][0].length;

  for (var i = 1; i < data[row].length; i++) {
    matchIndex = findEqualityEndpoint_(data[row][i-1], data[row][i], matchIndex);

    if (matchIndex == 0) {
      return;
    }
  }
 
  for (var i = 0; i < data[row].length; i++) {
    data[row][i] = data[row][i].substring(matchIndex, data[row][i].length);
  }
}

/**
 * Locates the index where the two strings values stop being equal, stopping automatically at the stopAt index.
 */
function findEqualityEndpoint_(string1, string2, stopAt) {
  if (!string1 || !string2) {
    return -1;
  }
 
  var maxEndpoint = Math.min(stopAt, string1.length, string2.length);
 
  for (var i = 0; i < maxEndpoint; i++) {
    if (string1.charAt(i) != string2.charAt(i)) {
      return i;
    }
  }
 
  return maxEndpoint;
}
 

/**
 * Converts the text to title case.
 */
function toTitleCase_(text) {
  if (text == null) {
    return null;
  }
 
  return text.replace(/\w\S*/g, function(word) { return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase(); });
}

/**
 * Returns true if the given set of options contains the given option.
 */
function hasOption_(options, option) {
  return options && options.indexOf(option) >= 0;
}

/**
 * Parses the given string into an object, trimming any leading or trailing spaces from the keys.
 */
function parseToObject_(text) {
  var map     = new Object();
  var entries = (text != null && text.trim().length > 0) ? text.toString().split(",") : new Array();
 
  for (var i = 0; i < entries.length; i++) {
    addToMap_(map, entries[i]);  
  }
 
  return map;
}

/**
 * Parses the given entry and adds it to the given map, trimming any leading or trailing spaces from the key.
 */
function addToMap_(map, entry) {
  var equalsIndex = entry.indexOf("=");  
  var key         = (equalsIndex != -1) ? entry.substring(0, equalsIndex) : entry;
  var value       = (key.length + 1 < entry.length) ? entry.substring(key.length + 1) : "";
 
  map[key.trim()] = value;
}

/**
 * Returns the given value as a boolean.
 */
function toBool_(value) {
  return value == null ? false : (value.toString().toLowerCase() == "true" ? true : false);
}

/**
 * Converts the value for the given key in the given map to a bool.
 */
function convertToBool_(map, key) {
  if (map[key] != null) {
    map[key] = toBool_(map[key]);
  }  
}
