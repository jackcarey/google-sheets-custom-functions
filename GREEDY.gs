/**
* @OnlyCurrentDoc
*/

/**
* Return the minimum count of each option needed to reach a target.
* @param {[]} options An array of numbers.
* @param {123} target The value you want to reach.
* @param {0} mode 0=strict, (Not yet implemented: 1=overshoot, 2=undershoot, 3=closest, 4=fractions). Default: 0;
* @param {FALSE} subtotals Include a a subtotal in each row. Default: FALSE.
* @customfunction
*/
function GREEDY(options,target,mode=0,subtotals=false) {
  //check parameters
  if(!options) throw new Error("options are required");
  if(isNaN(target)) throw new Error("target must be a number");
  mode = Math.floor(mode);
  mode = mode<0 ? 0 : (mode>4 ? 4 : mode);
  //ensure options is a 1D array of unique values, sorted in descending order
  options = _UNIQUE_2D(options);
  options.sort(function(a,b){return b-a;});
  //set up variables
  var output = new Array(options.length);
  var total = target;
  //max decimal places calculated automatically using regex
  var maxDP = 0;
  for(var i=0;i<options.length;++i){
    if(!isNaN(options[i])){
    var str = options[i].toString();
      var dpCount = str.indexOf(".")<0 ? 0 : str.replace(/.*\./,"").length;
    maxDP = Math.max(maxDP,dpCount);
    }
  }
  //for every option
  for(var i=0;i<output.length;++i){
    //add zero to the second  and optional third column;
    output[i] = subtotals ? [options[i],0,0] : [options[i],0];
    //get the value of the option
    var value = output[i][0];
    //only continue if this value leads us closer to our target
    var signsMatch = target<0 ? value<0 : value>0;
    if(signsMatch){
      //get as close as possible before the mode affects the output
      var count = Math.floor(total/value);
      if(count>=1){
        var subtotal = count*value;
      total -= subtotal;
      //round to max number of decimal places to avoid floating point issues
      total = total.toFixed(maxDP).valueOf();
      output[i][1] = count.toFixed(maxDP).valueOf();
        if(subtotals){
          output[i][2] = subtotal;
        }
      }else{
        output[i][1] = output[i][1].toFixed(maxDP);
      }
    }
  }
  //now the mode is applied if we haven't hit our target
  if(total>0){
  var lastRowIndex = output.length - 1;
      switch(mode){
        case 0: //strict - throw an error since we can't reach the target
          //throw new Error(target+" cannot be reached exactly with the given options");
          break;
        case 1: //overshoot - add the last (smallest) option on once
          //add 1 to count
          output[lastRowIndex][1]+=1;
          //update the subtotal column
          if(subtotals) output[lastRowIndex][2] = output[lastRowIndex][0]*output[lastRowIndex][1];
          break;
        case 3: //closest
          var newDiff = target - (total+output[lastRowIndex][0]);
          if(newDiff<total){
            //add 1 to count
          output[lastRowIndex][1]+=1;
          //update the subtotal column
          if(subtotals) output[lastRowIndex][2] = output[lastRowIndex][0]*output[lastRowIndex][1];
          }
          break;
        case 4: //fractions
          //add the fraction to the count
          output[lastRowIndex][1]+= total*output[lastRowIndex][0];
          //update the subtotal column
          if(subtotals) output[lastRowIndex][2] = output[lastRowIndex][0]*output[lastRowIndex][1];
          break;
        default: //2, undershoot - do nothing, we're as close as we're going to get
          break;
      }
  }
  return output;
}

/**
* Helper function.
* Return unique values from across a 2D range, ignoring empty cells.
* Stripped down version of https://github.com/jackcarey/google-sheets-custom-functions/blob/master/UNIQUE_2D.gs
* @param {[[]]} range The input values.
*/
function _UNIQUE_2D(range) {
  if(range){
    var obj = {};
    for(var i=0;i<range.length;++i){
      for(var j=0;j<range[0].length;++j){
        var val = range[i][j].toString();
        var keys = Object.keys(obj);
        if(val!=undefined && val!=null && val!=""){
          //if the item is not in the output
          if(keys.indexOf(val)==-1){
            //add it
            obj[val] = 1;
          }else{
            //if the item is already in the output add 1 to its count
            obj[val]+=1;
          }
      }
      }
    }
    var array = [];
    for(var k=0;k<keys.length;++k){
      var key = keys[k];
      array.push([key,obj[key]]);
    }
    //remove counts
      for(var l=0;l<array.length;++l){
        array[l] = array[l][0];
      }    
    return array;
  }
}