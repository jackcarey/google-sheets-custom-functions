# google-sheets-custom-functions
An incomplete list of custom functions I've made for Google Sheets. Documentation is found within each file.

* **ARRAYSTRING** - Join 2D arrays using separate row and column delimitators.
* **CELLWIDTH** - Get the width of a cell in pixels.
* **EXPLODE** - Split up concatenated data in a column by duplicating rows.
* **FORMULATEXT** - Return the formula for a given cell. Now redundent, use built-in FORMULA() function instead.
* **GREEDY**  - Return the minimum count of each given option needed to reach a target.
* **IFBLANK** - Like IFERROR, but for blank cells.
* **INSTANCE_NUMBER** - Return an array of instance numbers corresponding to items in a one-dimensional list.
* **PERMUTE** - Return all combinations of items from the columns of the input.
* **RANDOM** - Return a random number between 1 and 0, or between a range. This function replicates RAND() and RANDBETWEEN(), so random values can be used as inputs to custom functions.
* **RANGELINK** - Return a URL linking to a specific cell/range.
* **SQSP** - Return inventory,order,product, and transaction information from Squarespace.
* **TESCO_GROCERY** - Return grocery information via [Tescos API](https://devportal.tescolabs.com/).
* **TRANSLATE** - Translate strings from one language to another. Now redundent, use built-in GOOGLETRANSLATE() function instead.
* **UNIQUE_2D (minimal)** - Return a 1-dimensional list of unique items from a 2D array. Unique values are checked by cell content, not whole row content.
* **UNIQUE_2D** - Return a 1-dimensional list of unique items from a 2D array. Unique values are checked by cell content, not whole row content. Includes options for sorting and displaying the item counts.
* **WALKING_SECONDS** - Return the number of seconds required to walk the first route between two locations. Data from Google Maps.
* **file URLs to Drive** - Save files from a list of URLs into dynamic locations on Google Drive based on column headings.
* **store function** - A helper function for saving and returning data from the Cache and Properties services.
