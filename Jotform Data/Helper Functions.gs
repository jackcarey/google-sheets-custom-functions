/*******************
 * Helper Functions
 *******************/

function obj_to_param_str_(obj) {
    let keys = Object.keys(obj);
    let array = keys.map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`);
    return `?${array.join("&")}`;
}

function jf_url_(endpoint, parameters) {
    let paramStr = obj_to_param_str_(parameters);
    let base_uri = "https://api.jotform.com/";
    let eu_base_uri = "https://eu-api.jotform.com/";
    let hipaa_base_uri = "https://hipaa-api.jotform.com";
    let isEU = JFCache.isEU() ? true : false;
    let isHipaa = JFCache.isHipaa() ? true : false;
    return `${isEU ? eu_base_uri : isHipaa ? hipaa_base_uri : base_uri}${endpoint}${paramStr}`;
}

function JF_Request_(endpoint, parameters = {}, limit = 1000) {
    parameters["limit"] = Math.min(1000, Math.max(1, limit));
    let url = jf_url_(endpoint, parameters);
    let urls = [url];
    //if the limit is greater than 1000 then pagination will be needed
    if (limit > 1000) {
        for (let offset = 1000; offset < limit - 1000; offset += 1000) {
            let tempParams = parameters;
            tempParams["offset"] = offset;
            tempParams["limit"] = 1000;
            urls.push(jf_url_(endpoint, tempParams));
        }
    }
    let recentError = JFCache.requestsFailed(endpoint, parameters);
    if (recentError) {
        throw new Error(`Failed too recently: "${recentError}". Try again later.`);
    } else {
        let responses = [];
        try {
            responses = UrlFetchApp.fetchAll(urls);
        } catch (e) {
            JFCache.requestsFailed(
                endpoint,
                parameters,
                e.message ??
                    "Failed to fetch data from Jotform. Maybe your daily API limit has been reached. Try again later.",
                300
            );
        }
        let content_array = [];
        // check for errors with any of the responses
        for (let resp of responses) {
            let json = JSON.parse(resp.getContentText());
            let respCode = resp.getResponseCode();
            let jsonRespCode = json["responseCode"];
            let httpFail = respCode < 200 || respCode >= 300;
            let jsonFail = jsonRespCode < 200 || jsonRespCode >= 300;
            if (httpFail || jsonFail) {
                let msg = json.message ?? `Response Code: ${respCode}`;
                if (
                    (respCode == 301 || jsonRespCode == 301) &&
                    json["message"].indexOf("EU") != -1
                ) {
                    JFCache.isEU("Yes");
                } else if (
                    (respCode == 301 || jsonRespCode == 301) &&
                    json["message"].indexOf("HIPAA") != -1
                ) {
                    JFCache.isHipaa("Yes");
                } else if (respCode == 403 || jsonRespCode == 403) {
                    JFCache.requestsFailed(endpoint, parameters, msg, 300); //update the cache
                } else {
                    JFCache.requestsFailed(endpoint, parameters, msg); //update the cache
                }
                throw new Error(msg);
            } else {
                JFCache.limitLeft(parameters["apikey"], json["limit-left"]);
                if (json["limit-left"] <= 0) {
                    //allow future requests to fail for a while
                    JFCache.requestsFailed(
                        endpoint,
                        parameters,
                        "Daily API limit exceeded. Try again later."
                    );
                }

                let content = json["content"];
                if (content) {
                    let isArray = Array.isArray(content);
                    if (isArray) {
                        for (let row of content) {
                            if (row != null) {
                                content_array.push(row);
                            }
                        }
                    } else {
                        content_array.push(content);
                    }
                } else {
                    throw new Error("no content");
                }
            }
        }
        return content_array.length > 0 ? content_array : null;
    }
}

/***************************
 * Data transform functions
 * a function with the signature func(data, row, column, options) where data is a 2-dimensional array of the data
 * and row & column are the current row and column being processed. Any return value is ignored. Note that row 0
 * contains the headers for the data, so test for row==0 to process headers only.
 ***************************/

// change the headings of answer columns to be a bit prettier
function answersTransform_(data, row, column, options) {
    //do the default transform first
    defaultTransform_(data, row, column, options);
    if (row == 0) {
        let value = data[row][column];
        let replacedWithText = false;

        function replaceHeadingStart(lookFor, replacement) {
            for (let i = 0; i < data[row].length; ++i) {
                if (data[row][i].startsWith(lookFor)) {
                    data[row][i] = data[row][i].replace(lookFor, replacement);
                }
            }
        }

        //use the answer text where available
        if (value && value.toString().startsWith("Answers ") && value.endsWith(" Text")) {
            let answerID = value.replace(" Text", "").trim();
            let qText = data[row + 1][column];
            if (qText) {
                replacedWithText = true;
                replaceHeadingStart(answerID, qText.toString().trim());
            }
        }

        //if there is no 'Text' field available to pretty print the question, we can use the control type to do at least a small amount of prettifying,
        //taking advantage of the question number to keep this heading unique
        if (!replacedWithText && value && value.endsWith(" Type")) {
            let answerID = value.replace(" Text", "").trim();
            let type = toTitleCase_(
                data[row + 1][column].toString().replace("control_", "").trim()
            );
            replaceHeadingStart("Answers", type);
        }
    }
}

/******************
 * Jotform Data Fetch and Array Functions
 ******************/

function JF_Cache_Key_(endpoint, parameters = null, limit = 1000) {
    if (parameters == null) {
        parameters = { apikey: JFCache.apiKey() };
    }
    let fullKey = `${endpoint}${JSON.stringify(parameters)}${limit}`;
    let cleanKey = fullKey.replace(new RegExp("([^A-z0-9_])+", "gm"), "_").substring(0, 250);
    return cleanKey;
}

function From_Cache_(endpoint, parameters = null, limit = 1000) {
    let content = JFCache._item(JF_Cache_Key_(endpoint, parameters, limit));
    return content;
}

function Make_and_Cache_(endpoint, parameters = null, limit = 1000) {
    if (parameters == null) {
        parameters = { apikey: JFCache.apiKey() };
    }
    let cacheKey = JF_Cache_Key_(endpoint, parameters, limit);
    let content = null;
    try {
        content = JF_Request_(endpoint, parameters, limit);
    } catch (e) {
        if (e?.message?.indexOf("EU")) {
            JFCache.isEU(true);
        }
        if (e?.message?.indexOf("HIPAA")) {
            JFCache.isHipaa(true);
        }

        content = JF_Request_(endpoint, parameters, limit);
    }
    JFCache._item(cacheKey, "", content);
    return content;
}

function Parse_for_Import_(json, subItem) {
    let isSubmissions = subItem === "submissions";
    return parseJSONObject_(
        json,
        "",
        "noTruncate",
        null,
        isSubmissions ? answersTransform_ : defaultTransform_
    );
}
