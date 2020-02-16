"use strict";

const minimatch = require("minimatch");
const path = require("path");

module.exports = { shouldIgnoreDirectory, shouldIgnoreFile };

function shouldIgnoreDirectory(name, relativeParentPath, options) {
    if (shouldIgnoreDirectoryBasedOnName(name, options)) {
        return true;
    }

    return shouldIgnoreBasedOnGlobs(name, relativeParentPath, options.ignoredGlobs);
}

function shouldIgnoreDirectoryBasedOnName(name, options) {
    if (options.includeAllDirectoriesByDefault) {
        return false;
    } else {
        return name.startsWith(".") || name.startsWith("_") || name === "node_modules";
    }
}

function shouldIgnoreFile(name, relativeParentPath, options) {
    if (!name.endsWith(".md") || name === "README.md") {
        return true;
    }

    return shouldIgnoreBasedOnGlobs(name, relativeParentPath, options.ignoredGlobs);
}

function shouldIgnoreBasedOnGlobs(name, relativeParentPath, ignoredGlobs) {
    const relativePath = path.join(relativeParentPath, name);

    for (const ignoredGlob of ignoredGlobs) {
        if (minimatch(relativePath, ignoredGlob)) {
            return true;
        }
    }

    return false;
}
