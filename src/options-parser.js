"use strict";

const minimist = require("minimist");

module.exports = { getOptions };

function getOptions(commandLineArguments) {
    const parsedArguments = minimist(commandLineArguments);

    return {
        ignoredGlobs: makeArray(parsedArguments.ignore),
        linkToSubdirectoryReadme: parsedArguments.linkToSubdirectoryReadme || false,
        noSubdirectoryTrees: parsedArguments.noSubdirectoryTrees || false,
        orderNotesByTitle: parsedArguments.orderNotesByTitle || false,
        useTabs: parsedArguments.useTabs || false
    };
}

function makeArray(value) {
    if (!value) {
        return [];
    } else if (!Array.isArray(value)) {
        return [value];
    } else {
        return value;
    }
}
