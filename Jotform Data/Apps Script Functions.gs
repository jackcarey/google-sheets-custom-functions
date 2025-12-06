function include(filename) {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function wait(milli) {
    Utilities.sleep(isNaN(milli) ? 1 : Math.min(1, Math.round(milli)));
    return true;
}

function runSidebar(loadRowId) {
    try {
        var template = HtmlService.createTemplateFromFile("runSidebar"),
            props = PropertiesService.getDocumentProperties(),
            cache = CacheService.getDocumentCache(),
            dLock = null;
        try {
            dLock = LockService.getDocumentLock();
        } catch (e) {}
        var storedData = { creds: { api: "" } };
        var credStr = storedData.creds,
            creds = typeof credStr == "string" ? JSON.parse(credStr) : credStr;

        template.apiStored = JFCache.apiKey() != null;
        var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getName();
        var savedschedules =
            loadRowId && storedData["savedschedules"] ? storedData["savedschedules"] : null;

        var loadObj = null;
        if (loadRowId) {
            for (var i = 0; i < savedschedules.length; i++) {
                if (savedschedules[i].rowId == loadRowId) {
                    loadObj = savedschedules[i];
                    break;
                }
            }
        }
        var storedLast =
            loadObj ??
            storedData?.["lastSideSett"] ??
            JSON.parse(storedData["lastSideSett"]) ??
            null;
        var lastSideSett = loadObj ?? {
            sheet: storedLast?.sheet ?? activeSheet,
            protectSheet: storedLast?.protectSheet ? true : false,
            endpoint: storedLast?.endpoint ?? "Form",
            id: storedLast?.id ?? "",
            child: storedLast?.child ?? "Submissions",
            lite: storedLast?.lite ? storedLast.lite : false,
            limit: storedLast?.limit ?? 1000,
            offset: storedLast?.offset ?? 0,
            headerMode: storedLast?.headerMode ?? 0,
            protected: storedLast.protected ?? 0,
        };
        template.lastSheet = lastSideSett.sheet;
        template.lastProtectSheet = returnBool(lastSideSett.protectSheet);
        template.lastEndpoint = lastSideSett.endpoint;
        template.lastId = lastSideSett.id;
        template.lastChild = lastSideSett.child;
        template.lastLite = returnBool(lastSideSett.lite);
        template.lastLimit = lastSideSett.limit;
        template.lastOffset = lastSideSett.offset;
        template.lastHeaderMode = returnBool(lastSideSett.headerMode);
        template.lastProtected = lastSideSett?.protected ?? false;
        var importSheetOptions = [],
            allSheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
        for (var i in allSheets) {
            importSheetOptions.push(allSheets[i].getName());
        }
        template.importSheetOptions = importSheetOptions;

        template.endpoints = ["Form", "Submission", "User", "Report", "Folder"];

        SpreadsheetApp.getUi().showSidebar(
            template.evaluate().setTitle("Form Data for Jotform - Import")
        );
    } catch (e) {
        errorToast(e, "", "", 1);
    }
}

/*
* Update and return data from cache and proerty store effeciently.
* obj - if update = true, then key/pair values will be updated in cache and properties
      - if update =false, then store will be search for keys. values passed will be returned when stored == null
      - special case: string 'ALL' returns all values in prop store
* update - bool. should store be updated with passed values
* props - required. property store to use. document, user, script
* cache - optional. cache to use. document, user, script
* secs - number of seconds to cache data for
* lock - optional. lock to use. document,user,script
*/
function store(obj, update, props, cache, secs, lock) {
    function tryParse(obj) {
        var keys = Object.keys(obj);
        for (var i = 0; i < keys.length; i++) {
            try {
                var val = obj[keys[i]];
                try {
                    val = JSON.parse(obj[keys[i]]);
                } catch (e) {}
                obj[keys[i]] = val;
            } catch (err) {
                throw new Error("TP" + i);
            }
        }
        return obj;
    }

    secs = secs && !isNaN(secs) ? Math.max(1, Math.min(21600, secs)) : 21600;
    if (lock != null && lock != undefined && lock != "" && lock != false) {
        var success = lock.tryLock(secs); //lock.waitLock(secs);
    }
    if (obj == "ALL") {
        var stored = props.getProperties();
        update == false;
        if (cache) {
            CacheService.getDocumentCache().putAll(stored, secs);
        }

        if (lock != null && lock != undefined && lock != "" && lock != false) {
            try {
                if (lock.hasLock()) {
                    lock.releaseLock();
                }
            } catch (e) {}
        }
        return tryParse(stored);
    } else if (obj && typeof obj == "object") {
        update = update && ((!isNaN(update) && update >= 1) || update == true) ? true : false;
        if (update) {
            var allProps = props.getProperties(),
                updatedKeys = Object.keys(obj);
            for (var i in updatedKeys) {
                var nKey = updatedKeys[i];
                allProps[nKey] = JSON.stringify(obj[nKey]);
            }
            if (cache) {
                cache.putAll(allProps, secs);
            }
            props.setProperties(allProps, false);

            if (lock != null && lock != undefined && lock != "" && lock != false) {
                try {
                    if (lock.hasLock()) {
                        lock.releaseLock();
                    }
                } catch (e) {}
            }

            return tryParse(obj);
        } else {
            var rKeys = obj ? Object.keys(obj) : [];
            var cached = cache ? cache.getAll(rKeys) : {};
            if (Object.keys(cached).sort().join() == Object.keys(rKeys).sort().join()) {
                if (lock != null && lock != undefined && lock != "" && lock != false) {
                    try {
                        if (lock.hasLock()) {
                            lock.releaseLock();
                        }
                    } catch (e) {}
                }
                return cached;
            } else {
                var allProps = props.getProperties();
                if (cache) {
                    cache.putAll(allProps, secs);
                }
                for (var j in rKeys) {
                    var key = rKeys[j];
                    obj[key] = allProps[key] != null ? allProps[key] : obj[key];
                }

                if (lock != null && lock != undefined && lock != "" && lock != false) {
                    try {
                        if (lock.hasLock()) {
                            lock.releaseLock();
                        }
                    } catch (e) {}
                }
                return tryParse(obj);
            }
        }
    } else {
        throw new Error("object must be defined with type object");
    }
}

function scheduleCheck(eventObj, rowIdStr) {
    var now = new Date(),
        dProp = null,
        allProps = null,
        changed = 0;

    var props = PropertiesService.getDocumentProperties(),
        cache = CacheService.getDocumentCache();
    var dLock = null;
    try {
        dLock = LockService.getDocumentLock();
    } catch (e) {}
    var storedData = { savedschedules: [] };

    var savedschedules = storedData["savedschedules"] ? storedData["savedschedules"] : [];
    if (savedschedules.length < 1) {
        //console.log("no saved schedules");
        return false; //end function here
    }
    for (var i = 0; i < savedschedules.length; i++) {
        var schedObj = savedschedules[i],
            lastRun = schedObj.lastRun ? new Date(schedObj.lastRun) : 0,
            freq = schedObj.freq ? Math.max(4, Math.round(schedObj.freq)) : 0,
            minAge = new Date(now - (freq + 20 / 60) * (3600 * 1000)); //20 minute leniency allows for variance in when google runs the trigger); //20 minute leniency allows for variance in when google runs the trigger
        var rowIdStrBool = !rowIdStr || schedObj.rowId == rowIdStr ? true : false;
        if (freq != 0 && minAge >= lastRun && rowIdStrBool) {
            var setResult = setSheetOutput(JSON.stringify(schedObj), true);
            if (setResult) {
                changed++;
                savedschedules[i].lastRun = now;
            }
        }
    }
    if (changed > 0) {
        try {
            var storeObj = { savedschedules: savedschedules };
            if (!rowIdStr) {
                storeObj.lastTriggerCheck = now;
            }
            var res = storeObj;

            //console.log("%s schedules found. %s changed. %s res: %s",(savedschedules ? savedschedules.length : 0),changed, res?true:false,res);
            return res ? true : false;
        } catch (e) {
            console.log("error: %s", e.message);
            return false;
        }
    } else {
        //console.log("%s schedules found. no schedules changed.",savedschedules ? savedschedules.length : 0);
        return false;
    }
}

function scheduleSidebar() {
    try {
        var template = HtmlService.createTemplateFromFile("scheduleSidebar");
        var docProps = PropertiesService.getDocumentProperties(),
            dCache = CacheService.getDocumentCache(),
            dLock = null;
        try {
            dLock = LockService.getDocumentLock();
        } catch (e) {}
        var allProps = store("ALL", 0, docProps, dCache, 21600, dLock);
        var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getName();
        var storedLast = allProps?.["lastSideSett"] ? JSON.parse(allProps["lastSideSett"]) : null;

        var lastSideSett = {
            sheet: storedLast?.sheet ?? activeSheet,
            protectSheet: storedLast?.protectSheet ? true : false,
            endpoint: storedLast?.endpoint ? storedLast.endpoint : "Form",
            id: storedLast?.id ?? "",
            child: storedLast?.child ?? "Submissions",
            lite: storedLast?.lite ? false : true,
            limit: storedLast?.limit ?? 1000,
            offset: storedLast?.offset ?? 0,
            headerMode: storedLast?.headerMode ?? 0,
        };

        var savedschedules = allProps["savedschedules"]
            ? sortJSONArrayByKey(allProps["savedschedules"], "rowId")
            : [];

        template.lastSheet = lastSideSett?.sheet;
        template.lastProtectSheet = lastSideSett?.protectSheet ? true : false;
        template.lastEndpoint = lastSideSett?.endpoint;
        template.lastId = lastSideSett?.id;
        var storedInfo = allProps["formid-" + lastSideSett?.id];
        template.lastIdTitle = "";
        if (lastSideSett.endpoint.toLowerCase() == "form") {
            var title =
                storedInfo && storedInfo.title
                    ? storedInfo.title
                    : checkJFTitle(lastSideSett?.id)
                    ? checkJFTitle(lastSideSett?.id)
                    : "";
            template.lastIdTitle = title ? [title, lastSideSett?.child].join(" - ") : "";
        }
        template.lastChild = lastSideSett?.child;
        template.lastLite = lastSideSett?.lite;
        template.lastLimit = lastSideSett?.limit;
        template.lastOffset = lastSideSett?.offset;
        template.lastHeaderMode = lastSideSett?.headerMode;
        template.savedschedules = savedschedules;
        template.currentTitle =
            "Sheet: " +
            lastSideSett?.sheet +
            "\nProtect: " +
            lastSideSett?.protectSheet +
            "\nEndpoint: " +
            lastSideSett?.endpoint +
            "\nID: " +
            lastSideSett?.id +
            "\nChild: " +
            lastSideSett?.child +
            "\nLite: " +
            lastSideSett?.lite +
            "\nLimit: " +
            lastSideSett?.limit +
            "\nOffset: " +
            lastSideSett?.offset +
            "\nHeader Mode: " +
            lastSideSett?.headerMode;
        var sheetTZ = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
        template.sheetTZ = sheetTZ;
        template.schedFreqHrs = schedFreqHrs ? schedFreqHrs : 4;
        template.lastTriggerCheck = allProps["lastTriggerCheck"]
            ? Utilities.formatDate(
                  new Date(allProps["lastTriggerCheck"]),
                  sheetTZ,
                  "YYYY-MM-dd HH:mm"
              )
            : null;
        template.lastProtected = lastSideSett?.protected ?? false;
        SpreadsheetApp.getUi().showSidebar(
            template.evaluate().setTitle("Form Data for Jotform - Schedule")
        );
    } catch (e) {
        errorToast(e);
    }
}

function saveSchedule(objStr) {
    try {
        var dProp = PropertiesService.getDocumentProperties(),
            dCache = CacheService.getDocumentCache(),
            dLock = null;
        try {
            dLock = LockService.getDocumentLock();
        } catch (e) {}
        var allProps = {},
            existing = allProps["savedschedules"] ? allProps["savedschedules"] : [];
        var multiple = schedFreqHrs ? schedFreqHrs : 4,
            JSONobj = JSON.parse(objStr),
            rounded = Math.round((JSONobj.freq ? JSONobj.freq : multiple) / multiple) * multiple;
        JSONobj.freq = rounded;
        existing.push(JSONobj);
        var updated = { savedschedules: existing };
        return true;
    } catch (e) {
        errorToast(e);
    }
}

function checkTrigger(reset, rowIdStr) {
    var dProp = PropertiesService.getDocumentProperties(),
        dCache = CacheService.getDocumentCache(),
        lock = null;
    try {
        lock = LockService.getDocumentLock();
    } catch (e) {}
    var fnName = "scheduleCheck",
        storedData = { savedschedules: [] };

    if (lock != null && lock != undefined && lock != "" && lock != false) {
        lock.waitLock(30000);
    }

    if (reset == 1 || reset == true || reset == "yes" || reset == "y") {
        var existing = storedData["savedschedules"] ? storedData["savedschedules"] : [];
        for (var i = 0; i < existing.length; i++) {
            if ((rowIdStr && rowIdStr == existing[i].rowId) || !rowIdStr) {
                existing[i].lastRun = 0;
            } else {
                existing[i].lastRun = 0;
            }
        }
        var storeRes = { savedschedules: existing };
    }

    var triggerExists = 0;
    var triggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < triggers.length; i++) {
        var trigger = triggers[i];
        if (trigger.getHandlerFunction() === fnName) {
            triggerExists++;
            if (triggerExists > 1 || (!rowIdStr && reset)) {
                ScriptApp.deleteTrigger(trigger);
                triggerExists--;
            }
        } else {
            ScriptApp.deleteTrigger(trigger);
        }
    }
    if (triggerExists == 0) {
        ScriptApp.newTrigger(fnName)
            .timeBased()
            .everyHours(schedFreqHrs ? schedFreqHrs : 4)
            .create();
        triggerExists++;
    }

    if (lock != null && lock != undefined && lock != "" && lock != false) {
        try {
            lock.releaseLock();
        } catch (e) {}
    }

    return triggerExists;
}

function removeSchedule(rowId) {
    var dProp = PropertiesService.getDocumentProperties(),
        dCache = CacheService.getDocumentCache(),
        dLock = null;
    try {
        dLock = LockService.getDocumentLock();
    } catch (e) {}
    var existing = { savedschedules: [] };
    var removed = 0;

    for (var i = 0; i < existing.length; i++) {
        var obj = existing[i],
            objRowId = obj.rowId;
        if (rowId == objRowId) {
            existing.splice(i, 1);
            removed++;
        }
    }
    if (removed) {
        var storeRes = { savedschedules: existing };
        return removed;
    } else {
        throw new Error("schedule " + rowId + " not removed");
    }
}

function saveKeyPair(key, value) {
    try {
        var obj = {};
        obj[key] = value;
        var updated = obj;
        return updated;
    } catch (e) {
        errorToast(e);
    }
}

function toastMessage(msg, timeoutSeconds, title) {
    msg = msg ? msg : "";
    timeoutSeconds =
        !timeoutSeconds || timeoutSeconds <= 0 || isNaN(timeoutSeconds) ? 20 : timeoutSeconds;
    title = title ? title : "Form Data for Jotform";
    SpreadsheetApp.getActiveSpreadsheet().toast(msg, title, timeoutSeconds);
}

function errorMsg_(error) {
    var useErrorCode = true;

    //handle LockService issue, per https://issuetracker.google.com/issues/112384851 (feb 25th 2019 message)
    if (error.message.indexOf("too many LockService") != -1) {
        error.message = "Connection busy. Try again in a few minutes.";
        useErrorCode = false;
    }

    //supress error codes for jotform or user errors, since these will not need tracing
    switch (true) {
        case error.message.indexOf("You're not authorized to use") != -1:
        case error.message.indexOf("child must be one of") != -1:
            useErrorCode = false;
            break;
        default:
            break;
    }

    var fileInitials = "",
        fileNameWords = error && error.fileName ? error.fileName.split(" ") : "";
    for (var i = 0; i < fileNameWords.length; i++) {
        //check each character in each word to match alphanumerical values
        var word = fileNameWords[i];
        for (var j = 0; j < word.length; j++) {
            var char = word.substr(j, 1);
            var match = new RegExp("[A-z0-9]", "g").test(char);
            if (match) {
                fileInitials += char.toUpperCase();
                break;
            }
        }
    }
    var errorCode = !useErrorCode
        ? ""
        : (fileInitials ? fileInitials : "ERR") +
          (error && error.lineNumber
              ? (new RegExp("[0-9]", "g").test(fileInitials.substr(-1)) ? "." : "") +
                error.lineNumber
              : "");
    var msg = errorCode + (error && error.message ? (errorCode ? ": " : "") + error.message : "");
    return msg;
}

function errorToast(error, title, timeout, suppress) {
    var msg = errorMsg_(error);
    timeout = Math.max(5, isNaN(timeout) ? 30 : timeout);
    try {
        toastMessage(msg, timeout, title);
    } catch (e) {}
    if (
        suppress == false || suppress <= 0
            ? false
            : true && msg.toLowerCase().indexOf("connection busy") == -1
    ) {
        throw new Error(msg);
    }
}

function checkJFTitle(id) {
    var extractedTitle = null;
    var now = new Date(),
        dCache = CacheService.getDocumentCache(),
        dProp = PropertiesService.getDocumentProperties(),
        fIdKey = "formid-" + id;
    var obj = {};
    obj[fIdKey] = null;
    var storedData = obj,
        idProp = storedData["formid-" + id],
        idPropObj = idProp ? JSON.parse(idProp) : null;
    var storedTitle =
        idPropObj && idPropObj.date && new Date(idPropObj.date) >= now - 14 * 86400 * 1000
            ? idPropObj.title
            : null;
    if (storedTitle) {
        extractedTitle = storedTitle;
    } else {
        try {
            var cTxt = "";
            if (blockedAddresses.indexOf(id) == -1) {
                //don't try to fetch an address if it is blocked
                if (isNaN(parseInt(id.toString().trim()))) {
                    try {
                        cTxt = UrlFetchApp.fetch(id).getContentText();
                    } catch (e) {}
                } else {
                    cTxt = UrlFetchApp.fetch("https://jotform.com/" + id).getContentText();
                }
            }
            var extractedID = cTxt
                .match(regEx1)[0]
                .replace('<input type="hidden" name="formID" value="', "");

            extractedTitle = !cTxt
                ? null
                : cTxt
                      .match(new RegExp("<title>(.*?)</title>", "g"))
                      .toString()
                      .replace(new RegExp("</?title>", "g"), "");

            if (extractedID || extractedTitle) {
                obj[fIdKey] = JSON.stringify({ id: extractedID, date: now, title: extractedTitle });
                var updated = obj;
            }
        } catch (e) {}
    }
    return extractedTitle;
}

function sortJSONArrayByKey(array, key) {
    try {
        var key = key ? key : Object.keys(array).sort()[0];
        var sorted = array.sort(function (a, b) {
            var x = a[key] ? a[key].toString().toLowerCase() : "",
                y = b[key] ? b[key].toString().toLowerCase() : "",
                val = x == y ? 0 : x < y ? -1 : 1;
            return val;
        });
        return sorted;
    } catch (e) {
        return array;
    }
}

function returnBool(val) {
    var valStr = val ? val.toString().toLowerCase() : "";
    var result =
        valStr == "false" ||
        valStr == "n" ||
        valStr == "no" ||
        valStr == "off" ||
        val < 1 ||
        val == false
            ? false
            : true;
    return result;
}
