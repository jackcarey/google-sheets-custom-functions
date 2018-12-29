/**
* Returns the first argument if it is not blank, otherwise returns the second argument if present.
* @param {A1} value The value to return if the value itself is not blank.
* @param {"-"} value_if_blank The value the function returns if value is blank.
* @customfunction
*/
function IFBLANK(value,value_if_blank){
  return value=="" ? value_if_blank ? value_if_blank : "" : value;
}
