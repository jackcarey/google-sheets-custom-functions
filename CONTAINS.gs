/**
 * Returns TRUE if any of the values in the range contain the term.
 * @param {[]} range The range of data to check.
 * @param {"foo"} term. The term to search for.
 * @param {[FALSE]} caseSensitive Default: FALSE.
 * @customfunction
 */
function CONTAINS(range, term = "", caseSensitive = false) {
  term = term.toString();
  if (range.map) {
    return range.map(CONTAINS).some((res) => res ? true : false);
  } else if (term) {
    if (caseSensitive ? false : true) {
      term = term.toLowerCase();
      range = range.toString().toLowerCase();
    }
    return range.indexOf(term) != -1;
  } else {
    return false;
  }
}
