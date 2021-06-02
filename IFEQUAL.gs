/**
 * Return a value if two parameters are equal, otherwise return the first argument.
 * @param {"A"} first The first comparison value
 * @param {"B"} second The second comparison value
 * @param {"Equal"} [value] The value to return if first and second are eqaul.
 * @param {FALSE} [strict] Whether or not the comparison should be strict. Default: FALSE.
 * @customfunction
 */
function IFEQUAL(first,second,value="",strict=false){
  return (strict ? (first === second) : (first == second)) ? value : first;
}
