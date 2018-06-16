/**
* Translate from one language to another.
*
* @param {"Hello World"} str The string to translate.
* @param {"fr"} to The target language.
* @param {"en"} from Optional. The source language.
*/
function TRANSLATE(str,to,from){
  var locale = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetLocale();
  to = to ? to : locale.substring(0,locale.indexOf("_")).toLowerCase();
  if(from==undefined || from==null){
    from = "";
  }
  var key = from + "-" + to + "-" + encodeURIComponent(str);
  if(str?true:false){
  var cache = CacheService.getDocumentCache();
  var cached = cache.get(key);
  if(cached?true:false){
   return cached;
  }else{
    var value = LanguageApp.translate(str, from, to);
    cache.put(key, value,21600);
    return value;
  }
  }else{
    throw new Error(LanguageApp.translate("No 'str'","en",to));
  }
}
