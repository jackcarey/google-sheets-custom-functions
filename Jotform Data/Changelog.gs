// @OnlyCurrentDoc
/* ===================================================================================================================*
  Jotform Data by Jack Carey
  ====================================================================================================================================*/

var addonVersion = "25.27";
var schedFreqHrs = 2;
var blockedAddresses = []; //used by checkJFTitle() and makeRequest() to suppress errors
/*
  Project Page: https://github.com/jackcarey/jotformdata
  Copyright:    (c) 2028-2025 by Jack Carey
  License:      GNU General Public License, version 3 (GPL-3.0) 
                http://www.opensource.org/licenses/gpl-3.0.html
  ------------------------------------------------------------------------------------------------------------------------------------
  A script for returning data from Jotform for greater control of Google Sheets integration
     LISTKP       List keypairs to view stored results. Not to be used by end users.
     JOTFORM      Return data from Jotform (jotform.com)
     JOTFORM_ADVANCED  Return data from Jotform with advanced parameters.
  For bug reports see https://github.com/jackcarey/jotformdata/issues
  ------------------------------------------------------------------------------------------------------------------------------------
  Changelog:
  25.49 - (2025-12-06)
        - End support.
  25.27 - (2025-07-02)
        - refactor, update links
  21.52 - (23.12.21)
        - renamed from Jotform Data to Form Data for Jotform
        - re-written from scratch. JOTFORM and JOTFORM_ADVANCED are now legacy functions.
  20.05 - (31.01.20)
        - removed legacy JOTFORM_ADV() function. Use JOTFORM_ADVANCED() instead.
        - changed ID extraction to use hidden formID input tag, for easier regex and reduced errors
        - set autocomplete=off for text input HTML fields
        - temporarily disabled quick links until they can be made to work again
  20.03 - (13.01.20)
        - added conditional try/catch to setSheetOutput to surpress errors when run through scheduleCheck(), since errors here are not displayed but can be reproduced through then run sidebar.
  20.02 - (06.01.20)
        - added blockedAddresses array to silence erroneous logs
        - improved error handling
  20.01 - (03.01.20)
        - (a) re-named JOTFORM_ADV() to JOTFORM_ADVANCED().
        - (b) added 'Form Links' sidebar to link to all forms used in a document. Reordered help dialog sections.
        - (c) bug fix for save schedule button. changed error message for missing child
        - (d) minor change to title extraction to supress error when fetching custom URL for ID
  19.45 - (19.12.19)
        - (a) updated errorMsg_() loop to return only alphanumerical characters for the error code.
  19.44 - (27.10.19)
        - (a) implemented hasLock() and tryLock() within store function to try and reduce errors.
        -     replaced 'too many LockService...' error with 'Connection busy...'. in errorMsg_() to obfuscate lockservice issues.
        -     ref: https://issuetracker.google.com/issues/112384851 (feb 25th 2019 message)
        - (b) added 'too many LockService' supression to errorToast() function.
        - (c) changed 'too many lockService' error supression to 'connection busy' to also cover when the lockService times out.
  19.41 - (06.10.19)
        - (a)(b) Added missing try/catch for lockservices, will have null lock if there is an error. Occured when using store() function.
  19.37 - (14.09.19)
        - (a) Added contingency (try/catch) for LockService, in case it is invoked too often.
  19.36 - (02.09.19)
        - (a) scheduleSidebar bug fix for calling old function.
  19.35 - (26.08.19)
        - (a) changed schedFreqHrs from 4 to 2. triggers for incorrect functions are deleted in checkTrigger().
  19.34 - (22.08.19)
        - (a) renamed triggeredSchedules() to scheduleCheck() to force 6 hour triggers to 2.
  19.33 - (17-08-19)
        - (a) added clarification text on trigger being run every 4 hours.
  19.32 - (10-08-19)
        - (a) added eventObject parameter to triggeredSchedules() to prevent it being passed into rowIdStr. should fix triggeredschedule issues
        - (b) provisionally moved minimum frequency from 6 hours to 4. will be reverted if 'too much computer time' error returns.
        - (c) bug fix. checkTrigger now creates 4 hour trigger.
  19.31 - (03-08-19)
        - changed version numbering to YEAR.WEEKNUM[revision] / YY.WWrev / 19.31d
        - (d) trigger fix
        - (e) added 'last checked' to schedule sidebar
  1.1.3 -(2019-07-28)
        - moved the scheduleDialog() into the scheduleSidebar()
        - (c) allow individual run/check of each row (disabled until UI resolved)
  1.1.2 - (2019-07-25)
        - title parsing bug fix
        - object fixes
        - added options to delete document data
  1.1.1 - (2019-07-21)
        - using store() function for fewer PropertiesService calls (uses CacheService), should improve performance 
        - import cache changed from 15 minutes to 5.
  1.1.0 -(2019-04-20)
        - handled exception when extracted id == null 
  1.0.9 -(2019-03-16)
        - quick fix for add-on using too much computer time per day = fix minimum schedule to 6 hours and set trigger to run every 6 hours instead of every 30 minutes
  1.0.8 - (2018-12-08)
        - Automatic title extraction when form URL is provided. Only used to fill schedule name (import must be run once before schedule dialog is opened).
        - Styling updates. Headings, buttons and selects now use Roboto font.
        - Better string handling for long names in schedule dialog.
  1.0.7 - (2018-11-06)
        - Added scheduling to imports, including manual and forced checks
  1.0.6 - (2018-11-04)
        - Added import sidebar
  1.0.5 - (2018-09-20)
        - Form Id now extracted with UrlFetchApp and parsing, to support custom form URLs.
        - Cleaned up lite mode to remove order,sublabels and maxValue objects
  1.0.4 - (2018-07-27)
        - bug fix in answerFunc to stop oldKey loop from running when there are no keys
  1.0.3 - (2018-07-20)
        - Now uses each questions 'text' as header, instead of answer 1, answer 2, ... , answer 101 etc. Done using transformJotformJSON function passed to makeRequest
        - If 'updated_at' is blank, fill it with 'created_at'. Useful for lite mode.
        - Filter parameter for advanced function. Pass a filter object to 
        - Better region (EU) check. Stores isEU in document properties to reduce number of requests made.
  1.0.2 - (2018-07-08)
        - Fixed endpoint & child parameter to accept different capitalisation
        - Fixed EU Safe Mode error
        - improved error handling
  1.0.1 - Added support for '*' wildcard in xpath rules
  1.0.0 - (2018-06-20)
        - Initial release
        - pagination for endpoints that allow it
        - lite mode to return a reduced set of data
 *====================================================================================================================================*/
