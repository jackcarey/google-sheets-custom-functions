# google-sheets-custom-functions
An incomplete list of custom functions I've made for Google Sheets. Documentation is found within each file.

## Algorithms

* **CRATE** - Sort options into groups so their sum is as close to a target as possible.
* **EXPLODE** - Split up concatenated data in a column by duplicating rows.
* **FIZZBUZZ** - Return an array of fizz buzz results.
* **GREEDY**  - Return the minimum count of each given option needed to reach a target.

## Arrays

* **ARRAYSTRING** - Join 2D arrays using separate row and column delimitators.
* **COLUMN_JOIN** - Join columns by row, optionally prefixing with the column header.
* **PERIODIC_AMOUNTS** - Return dates that an amount would appear over a given period
* **PERMUTE** - Return all combinations of items from the columns of the input.

## Conditions / Checks

* **CONTAINS** - Returns `TRUE` if any of the values in the range contain the term.
* **EVERY** - Returns `TRUE` if all of the values in the range have a truthy value.
* **IFBLANK** - Like `IFERROR`, but for blank cells.
* **IFEQUAL** - Return a value if two parameters are equal, otherwise return the first argument.
* **INSTANCE_NUMBER** - Return an array of instance numbers corresponding to items in a one-dimensional list.
* **SOME** - Returns `TRUE` if any of the values in the range have a truthy value.

## Miscellaneous

* **CELLWIDTH** - Get the width of a cell in pixels.
* **EXCEL_LINK** - Return a link to export the current document in .xlsx format.
* **RANDOM** - Return a random number between 1 and 0, or between a range. This function replicates `RAND()` and `RANDBETWEEN()`, so random values can be used as inputs to custom functions.
* **RANGELINK** - Return a URL linking to a specific cell/range.
* **SQSP** - Return inventory,order,product, and transaction information from Squarespace.
* **TRAVEL_SECONDS** - Return the number of seconds required to travel the first route between two locations. Data from Google Maps.

## Scripts or Partial Code

* **file URLs to Drive** - Save files from a list of URLs into dynamic locations on Google Drive based on column headings.
* **grabCSV.gs** - Import CSVs to a specific sheet. Designed to be run on a scheduled basis.
* **store function** - A helper function for saving and returning data from the Cache and Properties services.
* **POST-to-row** - Logs the parameter values of a POST request to then named sheet. Must be set up with a web app deployment.

## Redundant or Outdated

* **FORMULATEXT** - Return the formula for a given cell. Now redundent, use built-in `FORMULA()` function instead.
* **TESCO_GROCERY** - Return grocery information via [Tescos API](https://devportal.tescolabs.com/). Now outdated, Tesco has rescinded access to their API.
* **TRANSLATE** - Translate strings from one language to another. Now redundant, use built-in `GOOGLETRANSLATE()` function instead.
* **UNIQUE_2D** - Return a 1-dimensional list of unique items from a 2D array. Unique values are checked by cell content, not whole row content. Includes options for sorting and displaying the item counts. Now  redudant, use the built infuctions `UNIQUE(FLATTEN())`.
