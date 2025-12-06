function JF_CUSTOM_FUNC_(endpoint, parameters = null, limit = 1000, transformFunc = null) {
    let cached = From_Cache_(endpoint, parameters, limit);
    let json = null;
    if (cached) {
        try {
            json = cached;
        } catch (e) {}
    }
    if (json == null) {
        json = Make_and_Cache_(endpoint, parameters, limit);
    }
    if (json != null) {
        return parseJSONObject_(json, "", "noTruncate", null, transformFunc ?? defaultTransform_);
    }
}

/*******************
 * Custom Functions
 ********************/

/** Get information about the authorized user.
 * @param {"submissions"} subItem Optional. Specific information about the user. One of usage, submissions, subusers, folders, reports, forms, settings.
 * @param {1000} limit The maximum number of rows to return. Default: 1000.
 * @param {"456..."} apiKey Optional. Your API for Jotform, if not the default.
 * @customfunction
 */
function JF_USER(subItem = null, limit = 1000, apiKey = null) {
    let subItems = ["usage", "submissions", "subusers", "folders", "reports", "forms", "settings"];
    if (subItem && subItems.indexOf(subItem) == -1) {
        throw new Error(`if used, subItem must be one of ${subItems.sort().join(", ")}.`);
    }
    let endpoint = `user${subItem ? "/" + subItem : ""}`;
    let params = { apikey: apiKey ?? JFCache.apiKey() };
    let transformFunc = subItem === "submissions" ? answersTransform_ : defaultTransform_;
    return JF_CUSTOM_FUNC_(endpoint, params, limit, transformFunc);
}
/** Get information about a form.
 * @param {"123..."} id Form ID.
 * @param {"submissions"} subItem Optional. Specific information about the form. One of questions, properties, reports, files, webhooks, submissions.
 * @param {1000} limit The maximum number of rows to return. Default: 1000.
 * @param {"456..."} apiKey Optional. Your API for Jotform, if not the default.
 * @customfunction
 */
function JF_FORM(id, subItem = null, limit = 1000, apiKey = null) {
    if (!id) {
        throw new Error("id is required");
    }
    let subItems = ["questions", "properties", "reports", "files", "webhooks", "submissions"];
    if (subItem && subItems.indexOf(subItem) == -1) {
        throw new Error(`if used, subItem must be one of ${subItems.sort().join(", ")}.`);
    }
    let endpoint = `form/${id}${subItem ? "/" + subItem : ""}`;
    let params = { apikey: apiKey ?? JFCache.apiKey() };
    let transformFunc = subItem === "submissions" ? answersTransform_ : defaultTransform_;
    return JF_CUSTOM_FUNC_(endpoint, params, limit, transformFunc);
}

/** Get a singe submission.
 * @param {"123..."} id Submission ID.
 * @param {"456..."} apiKey Optional. Your API for Jotform, if not the default.
 * @customfunction
 */
function JF_SUBMISSION(id, apiKey = null) {
    if (!id) {
        throw new Error("id is required");
    }
    let endpoint = `submission/${id}`;
    let params = { apikey: apiKey ?? JFCache.apiKey() };
    return JF_CUSTOM_FUNC_(endpoint, params, 1000, answersTransform_);
}

/** Get more information about a data report.
 * @param {"123..."} id Report ID.
 * @param {"456..."} apiKey Optional. Your API for Jotform, if not the default.
 * @customfunction
 */
function JF_REPORT(id, apiKey = null) {
    if (!id) {
        throw new Error("id is required");
    }
    let endpoint = `report/${id}`;
    let params = { apikey: apiKey ?? JFCache.apiKey() };
    return JF_CUSTOM_FUNC_(endpoint, params);
}

/** Get a list of forms in a folder, and other details about the form such as folder color.
 * @param {"123..."} id Folder ID.
 * @param {"456..."} apiKey Optional. Your API for Jotform, if not the default.
 * @customfunction
 */
function JF_FOLDER(id, apiKey = null) {
    if (!id) {
        throw new Error("id is required");
    }
    let endpoint = `folder/${id}`;
    let params = { apikey: apiKey ?? JFCache.apiKey() };
    return JF_CUSTOM_FUNC_(endpoint, params);
}

/** Get limit and prices of a plan.
 * @param {"FREE"} name The name of the plan.
 * @customfunction
 */
function JF_PLAN(name) {
    if (!name) {
        //attempt to get the authorized users acccount type as a useful default
        try {
            let user = JF_USER();
            let index = user[0].indexOf("/account_type");
            if (index == -1) {
                index = user[0].indexOf("Account Type");
            }
            let account_url = user[1][index];
            name = account_url
                .replace("https://api.jotform.com/system/plan/", "")
                .replace("https://eu-api.jotform.com/system/plan/");
        } catch (e) {}
    }
    if (!name) {
        throw new Error("name is required");
    }
    name = name.toUpperCase();
    let endpoint = `system/plan/${name}`;
    return JF_CUSTOM_FUNC_(endpoint);
}

/** Parse JSON formatted answers given by some Jotform questions
 * @param {"{...}"} string The JSON formatted string to parse.
 * @customfunction
 */
function JF_PARSE(string) {
    if (!string) {
        throw new Error("string is required");
    }
    let json = null;
    try {
        json = JSON.parse(string);
    } catch (e) {
        throw new Error("could not parse string as JSON.");
    }
    return parseJSONObject_(json, "", "noTruncate", null, defaultTransform_);
}

function JF_LIMIT_LEFT(apiKey = null) {
    apiKey = apiKey ?? JFCache.apiKey();
    let value = 0;
    value = JFCache.limitLeft(apiKey);
    return value == Infinity ? 1.79769e308 : value; //1.79769E+308 is the largest number Sheets can display properly
}

/** User activity log about things like forms created/modified/deleted, account logins and other operations. Often fails on Jotforms end.
 * @param {"lastWeek"} period Options. One of all, lastWeek, lastMonth, last3Months, last6Months, lastYear. Default: lastWeek.
 * @param {"456..."} apiKey Optional. Your API for Jotform, if not the default.
 * //@customfunction
 */
function JF_HISTORY(period = "lastWeek", apiKey = null) {
    let periods = ["all", "lastWeek", "lastMonth", "last3Months", "last6Months", "lastYear"];
    if (period && periods.indexOf(period) == -1) {
        throw new Error(`if used, period must be one of ${periods.sort().join(", ")}.`);
    }
    apiKey = apiKey ?? JFCache.apiKey();
    let cacheKey = period + "_" + apiKey;
    let cached = JFCache.history(cacheKey);
    let json = null;
    try {
        json = JSON.parse(cached);
    } catch (e) {}
    if (json == null) {
        let params = { apikey: apiKey };
        params["date"] = period;
        json = Make_and_Cache_(`user/history`, params);
    }
    if (json != null) {
        return parseJSONObject_(json, "", "noTruncate", null, defaultTransform_);
    }
}
