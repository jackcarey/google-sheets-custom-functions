/**
 * Sort options into groups so their sum is as close to the target as possible.
 * @param {A2:B} options Two column array. First column: labels, second column: values
 * @param {250} target The target to hit for each crate.
 * @param {TRUE} showTotals Should the total of each crate be returned in the result. Default: TRUE.
 * @param {TRUE} isInclusive Is the target inclusive of or less than its value. Default: TRUE.
 * @param {TRUE} hasHeadings Do the options have headings in row 1? Default: TRUE.
 * @param {", "} joinChar The character or string to join options with
 * @return {[]} An array of combinations
 * @customfunction
 */
function CRATE(options, target, showTotals=true, isInclusive = true, hasHeadings = true, joinChar = ", ") {
  let results = [];
  if (hasHeadings) {
    results = [options[0]];
    options.splice(0, 1);
  }
  //remove blank options
  options = options.filter(option => option[0].length);
  //function to sum up the values in a crate
  const total = (crate) => Object.keys(crate).reduce((sum, key) => sum + crate[key], 0);
  //function to return the potential options to help fill a crate, in desc. order
  const valid = (options, crate) => {
    options.sort((a, b) => b[1] - a[1]);
    return options.filter(option => {
      if (isInclusive) {
        return option[1] + total(crate) <= target;
      } else {
        return option[1] + total(crate) < target;
      }
    });
  };
  while (options.length > 0) {
    let crate = {};
    while (valid(options, crate).length) {
      let largest = valid(options, crate)[0];
      let key = largest[0];
      let val = largest[1];
      crate[key] = val;
      //remove this option so it won't be used twice
      options = options.filter(option => option[0] != key);
    }
    results.push([Object.keys(crate).sort().join(joinChar),total(crate)]);
  }
  if(!showTotals){
    results.forEach(row=>delete row[1]);
  }
  return results;
}
