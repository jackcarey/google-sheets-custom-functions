/**
 * Return variable length permutations from a 1D list.
 * @customfunction
 */
function PERMUTE_VAR(arr, join=",") {
  // from https://stackoverflow.com/questions/23698029/unique-permutations-of-variable-length
  var perms = [arr[0]];
  for (var i = 1; i < arr.length; i += 1) {
    len = perms.length;
    for (var j = 0; j < len; j += 1) {
        perms.push(perms[j] + join + arr[i]);
    }
  }
  return perms;
}
