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
