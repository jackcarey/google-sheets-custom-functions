/**
 * Returns TRUE if all of the values in the range have a truthy value.
 * @param {[]} range The range of data to check.
 * @customfunction
 */
function EVERY(range) {
  if (range.map) {
    return range.map(EVERY).every((res) => res ? true : false);
  } else {
    return range ? true : false;
  }
}
