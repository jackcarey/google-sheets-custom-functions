/**
* Translate from one language to another.
*
* @param {"Hello World"} str The string to translate.
* @param {"en"} from Optional. The source language.
* @param {"fr"} to The target language.
* @customfunction
*/
function TRANSLATE(str,from,to){
  var cache = CacheService.getDocumentCache();
  var key = from + "-" + to + "-" + encodeURIComponent(str);
  var cached = cache.get(key);
  if(cached?true:false){
   return cached;
  }else{
    var value = LanguageApp.translate(str, from, to);
    cache.put(key, value,21600);
    return value;
  }
}
