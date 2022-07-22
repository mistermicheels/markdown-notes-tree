"use strict";

const minimist = require("minimist");

const defaultOptions = {
    allowMissingTitle: false,
    ignore: [],
    includeAllDirectoriesByDefault: false,
    includeUpwardNavigation: false,
    linkToSubdirectoryReadme: false,
    noSubdirectoryTrees: false,
    notesBeforeDirectories: false,
    numberSpaces: 4,
    orderNotesByTitle: false,
    readmeFilename: "README.md",
    silent: false,
    subdirectoryDescriptionOnNewLine: false,
    useTabs: false
};

module.exports = { getOptions, defaultOptions };

// minimist adds a key _ by default
const argumentsKeysToIgnore = ["_"];

function getOptions(commandLineArguments) {
    const parsedArguments = minimist(commandLineArguments);
    parsedArguments.ignore = makeStringArray(parsedArguments.ignore);

    const options = { ...defaultOptions };

    for (const key in parsedArguments) {
        const keyIsKnown = key in defaultOptions;

        if (keyIsKnown && isSameType(parsedArguments[key], defaultOptions[key])) {
            options[key] = parsedArguments[key];
        } else if (keyIsKnown) {
            throw new Error(`Unexpected use of argument ${key}`);
        } else if (!argumentsKeysToIgnore.includes(key)) {
            throw new Error(`Unknown argument ${key}`);
        }
    }

    return options;
}

function makeStringArray(value) {
    if (!value) {
        return [];
    } else if (!Array.isArray(value)) {
        return [value.toString()];
    } else {
        return value.map(entry => entry.toString());
    }
}

function isSameType(a, b) {
    return Object.prototype.toString.apply(a) === Object.prototype.toString.apply(b);
}
