/**
 * Returns TRUE if any of the values in the range have a truthy value.
 * @param {[]} range The range of data to check.
 * @customfunction
 */
function SOME(range) {
  if (range.map) {
    return range.map(SOME).some((res) => res ? true : false);
  } else {
    return range ? true : false;
  }
}
