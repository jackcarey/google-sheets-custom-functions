/**
* @OnlyCurrentDoc
*/

/**
* Return the minimum count of each option needed to reach a target.
* @param {[]} options An array of numbers.
* @param {123} target The value you want to reach.
* @param {0} mode 0=strict,1=overshoot, 2=undershoot, 3=closest, 4=fractions. Default: 0;
* @param {FALSE} subtotals Include a a subtotal in each row. Default: FALSE.
* @param {FALSE} excludeZero Exclude rows with a count of zero. Default: FALSE.
* @customfunction
*/
function GREEDY(options,target,mode=0,subtotals=false,excludeZero=false) {
  //check parameters
  if(!options) throw new Error("options are required");
  if(isNaN(target)) throw new Error("target must be a number");
  mode = Math.floor(mode);
  mode = mode<=0 ? 0 : (mode>=4 ? 4 : Math.floor(mode));
  //ensure options is a 1D array of unique values, sorted in descending order
  options = _UNIQUE_2D(options);
  options.sort(function(a,b){return parseFloat(b)-parseFloat(a);});
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
    //add zero to the second and optional third column;
    output[i] = subtotals ? [parseFloat(options[i]),0,0] : [parseFloat(options[i]),0];
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
      //round to max number of decimal places+1 to avoid floating point issues, but maintain precision
      total = total.toFixed(maxDP+1).valueOf();
      output[i][1] = parseFloat(count.toFixed(maxDP).valueOf());
        if(subtotals){
          output[i][2] = subtotal;
        }
      }else{
        output[i][1] = parseFloat(output[i][1].toFixed(maxDP));
      }
    }
  }
  
  //now the mode is applied if we haven't hit our target
  if(total>0){
  var lastRowIndex = 0;
    //ensure we use the correct smallest value
    for(var i=0;i<output.length;++i){
      var value = output[i][0];
      var signsMatch = target<0 ? value<0 : value>0;
      if(signsMatch && output[i][0]< output[lastRowIndex][0]){
        lastRowIndex = i;
      }
    }
      switch(mode){
        case 0: //strict - throw an error since we can't reach the target
          throw new Error(target+" cannot be reached exactly. Change mode or options.");
          break;
        case 1: //overshoot - add the last (smallest) option on once
          //add 1 to count
          output[lastRowIndex][1] = parseInt(output[lastRowIndex][1])+1;
          //update the subtotal column
          if(subtotals) output[lastRowIndex][2] = output[lastRowIndex][0]*output[lastRowIndex][1];
          break;
        case 3: //closest
          var oldDiff = parseFloat(total);
          var newDiff = output[lastRowIndex][0] - oldDiff;
          if(newDiff < oldDiff){
            //add 1 to count
          output[lastRowIndex][1] = parseFloat(output[lastRowIndex][1]) + 1;
          //update the subtotal column
          if(subtotals) output[lastRowIndex][2] = output[lastRowIndex][0]*output[lastRowIndex][1];
          }
          break;
        case 4: //fractions
          //add the fraction to the count
          var fraction = parseFloat(total / output[lastRowIndex][0]);
          output[lastRowIndex][1]= parseFloat(output[lastRowIndex][1])+fraction;//*output[lastRowIndex][0];
          //update the subtotal column
          if(subtotals) output[lastRowIndex][2] = output[lastRowIndex][0]*output[lastRowIndex][1];
          break;
        default: //2, undershoot - do nothing, we're as close as we're going to get
          break;
      }
  }
  if(excludeZero){
    output = output.filter(row => row[1]>0);
  }
  return output;
}

/**
* Helper function.
* Return unique values from across a 2D range.
* Modified to exclude empty cells - from: https://github.com/jackcarey/google-sheets-custom-functions/blob/master/UNIQUE_2D%20(minimal).gs
* @param {[[]]} range The input values.
*/

function _UNIQUE_2D(range){
  if(!range) return;
  var oneD = [];
  //flatten the 2D array to 1D
  for(var i=0;i<range.length;++i){
    for(var j=0;j<range[i].length;++j){
      if(range[i][j]!=""){
        oneD.push(range[i][j]);
      }
    }
  }
  //filter and return the unique values
  return oneD.filter(function (value, index, self) { 
    return self.indexOf(value) === index;
  });
}