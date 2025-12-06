class DocCache {
    constructor() {}
    static get(key) {
        return CacheService.getDocumentCache().get(key);
    }
    static getAll(keys) {
        return CacheService.getDocumentCache().getAll(keys);
    }
    static put(key, value, secs = 21600) {
        secs = secs < 0 ? 0 : secs >= 21600 ? 21600 : secs;
        if (secs > 0) {
            CacheService.getDocumentCache().put(key, value, secs);
        }
    }
    static putAll(dict, secs = 21600) {
        secs = secs < 0 ? 0 : secs >= 21600 ? 21600 : secs;
        if (secs > 0) {
            CacheService.getDocumentCache().put(dict, secs);
        }
    }
    static remove(key) {
        CacheService.getDocumentCache().remove(key);
    }
    static removeAll(keys) {
        CacheService.getDocumentCache().removeAll(keys);
    }
}

class DocProps {
    constructor() {}
    static get(key) {
        return PropertiesService.getDocumentProperties().getProperty(key);
    }
    static getAll(keys) {
        let all = PropertiesService.getDocumentProperties().getProperties();
        let result = [];
        for (let key of keys) {
            if (all[key] || all[key] == false) {
                result.push(all[key]);
            }
        }
        return result;
    }
    static put(key, value) {
        PropertiesService.getDocumentProperties().setProperty(key, value);
    }
    static putAll(dict) {
        PropertiesService.getDocumentProperties().setProperties(dict, false);
    }
    static remove(key) {
        PropertiesService.getDocumentProperties().deleteProperty(key);
    }
    static removeAll(keys) {
        for (key of keys) {
            DocProps.remove(key);
        }
    }
    static keys() {
        return PropertiesService.getDocumentProperties().getKeys();
    }
    static clear() {
        PropertiesService.getDocumentProperties().deleteAllProperties();
    }
}

class JFProps {
    constructor() {}
    static _item(prefix, key, newValue, suppressErrors = false) {
        try {
            let cacheKey = `${prefix}_${key}`;
            if (newValue != null) {
                DocProps.put(cacheKey, JSON.stringify(newValue));
            }
            return newValue ?? JSON.parse(DocProps.get(cacheKey));
        } catch (e) {
            if (!suppressErrors) {
                throw new Error(e);
            }
        }
    }

    static keys() {
        return DocProps.keys();
    }

    static clear() {
        DocProps.clear();
    }
}

class JFCache {
    constructor() {}
    static _item(prefix, key = "", newValue, secs = 21600, suppressErrors = false) {
        try {
            let cacheKey = `${prefix}_${key}`;
            if (newValue != null) {
                DocCache.put(cacheKey, JSON.stringify(newValue), secs);
            }
            let retValue = newValue;
            try {
                retValue = retValue ?? JSON.parse(DocCache.get(cacheKey));
            } catch (e) {}
            return retValue ?? DocCache.get(cacheKey);
        } catch (e) {
            const isTooLarge = ("" + e?.message).includes("Argument too large");
            if (!suppressErrors && !isTooLarge) {
                throw new Error(e);
            }
        }
    }

    static isEU(newValue = null) {
        let val = newValue ? 1 : 0;
        let c = JFCache._item("is", "EU", val) ? true : false;
        let p = 0;
        if (newValue || !c) {
            p = JFProps._item("is", "EU", val);
            JFCache._item("is", "EU", p ? 1 : 0);
        }
        return c || p ? true : false;
    }

    static isHipaa(newValue = null) {
        let val = newValue ? 1 : 0;
        let c = JFCache._item("is", "HIPAA", val) ? true : false;
        let p = 0;
        if (newValue || !c) {
            p = JFProps._item("is", "HIPAA", val);
            JFCache._item("is", "HIPAA", p ? 1 : 0);
        }
        return c || p ? true : false;
    }

    static apiKey(newValue = null) {
        let c = JFCache._item("api", "key", newValue);
        let p;
        if (newValue || !c) {
            p = JFProps._item("api", "key", newValue);
            JFCache._item("api", "key", p);
        }
        return c ?? p;
    }

    static limitLeft(apiKey, newValue = null) {
        return JFCache._item("limit_left", apiKey, newValue) ?? Infinity; //if we don't know how many requests are left we must assume there are some
    }

    static requestsFailed(endpoint, params, msg = null, secs = 3600) {
        return JFCache._item("requestsFailed", endpoint + JSON.stringify(params), msg, secs); //only cache for an hour by default
    }

    static lastImport(newValue = null) {
        if (newValue != null && newValue["apiKey"]) {
            delete newValue["apiKey"];
        }
        let c = JFCache._item("last", "import", newValue);
        let p;
        if (newValue || !c) {
            p = JFProps._item("last", "import", newValue);
            JFCache._item("last", "import", p);
        }
        return c ?? p;
    }

    static removeAll(keys) {
        DocCache.removeAll(keys);
    }

    static empty() {
        let pKeys = JFProps.keys();
        JFCache.removeAll(pKeys);
        JFProps.clear();
    }
}
