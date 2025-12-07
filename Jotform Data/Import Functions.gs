/******************
 * Import Functions
 ******************/

function JF_IMPORT_DATA(obj) {
    if (!obj) {
        throw new Error("no object");
    }
    let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(obj["sheetName"]);
    if (obj["protected"]) {
        sheet
            .protect()
            .setWarningOnly(true)
            .setDescription("Protected by Form Data for Jotform import");
    }
    let id = obj["id"];
    let subItem = obj["subItem"] ?? null;
    let api = obj["apiKey"] ?? JFCache.apiKey();
    let limit = obj["limit"] ?? 1000;
    let params = { apiKey: api };
    let json = null;
    switch (obj["data"]) {
        case "user":
            if (subItem == "submissions" && limit < 1) {
                throw new Error("limit must be at least 1");
            }
            json = Make_and_Cache_(`user${subItem ? "/" + subItem : ""}`, params, limit);
            break;
        case "form":
            if (subItem == "submissions" && limit < 1) {
                throw new Error("limit must be at least 1");
            }
            json = Make_and_Cache_(`form/${id}${subItem ? "/" + subItem : ""}`, params, limit);
            break;
        case "report":
            json = Make_and_Cache_(`report/${id}`, params, limit);
            break;
        case "folder":
            json = Make_and_Cache_(`folder/${id}`, params, limit);
            break;
        default:
            break;
    }
    if (json != null) {
        let array = Parse_for_Import_(json, subItem);
        sheet.getRange(1, 1, array.length, array[0].length).setValues(array);

        JFCache.lastImport(obj); //store the object so we can reload these settings next time

        return true;
    } else {
        throw new Error("No data from Jotform");
    }
}
