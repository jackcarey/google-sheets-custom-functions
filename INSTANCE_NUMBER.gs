/**
* Return an array of instance numbers corresponding to items in a one-dimensional list.
* @param {[]} list The list of items to iterate over.
* @param {FALSE} showData Whether the input data should be shown with each instance number. Default: FALSE.
* @customfunction
*/
function INSTANCE_NUMBER(data,showData=false){
  if(!data) throw new Error("data is required");
  var output = (showData ? data : new Array(data.length));
  var runningCountObj = {};
  //create all of the keys we need
  for(var i=0;i<data.length;++i){
    var cell = data[i]?data[i]:"FALSE";
    var keys = Object.keys(runningCountObj);
    if(keys.indexOf(cell)==-1){
      runningCountObj[cell] = 0;
    }
  }
  //set the object and output values by iterating through every row
  for(var i=0;i<data.length;++i){
    var cell = data[i];
    //add one to the relevant count
    runningCountObj[cell]+=1;
    var value = runningCountObj[cell];
    if(showData){
      output[i].push(value);
    }else{
      output[i] = value;
    }
  }
  return output;
}