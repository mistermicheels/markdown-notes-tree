"use strict";

module.exports = { compareIgnoringCaseAndDiacritics };

function compareIgnoringCaseAndDiacritics(a, b) {
    return a.localeCompare(b, "en", { sensitivity: "base" });
}
