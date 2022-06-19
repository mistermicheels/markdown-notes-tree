"use strict";

const minimatch = require("minimatch");
const path = require("path");

module.exports = { shouldIgnoreDirectory, shouldIgnoreFile };

function shouldIgnoreDirectory(name, relativeParentPath, environment) {
    if (shouldIgnoreDirectoryBasedOnName(name, environment)) {
        return true;
    }

    return shouldIgnoreBasedOnGlobs(name, relativeParentPath, environment);
}

function shouldIgnoreDirectoryBasedOnName(name, environment) {
    if (environment.options.includeAllDirectoriesByDefault) {
        return false;
    } else {
        return name.startsWith(".") || name.startsWith("_") || name === "node_modules";
    }
}

function shouldIgnoreFile(name, relativeParentPath, environment) {
    if (!name.endsWith(".md") || name === environment.options.readmeFilename) {
        return true;
    }

    return shouldIgnoreBasedOnGlobs(name, relativeParentPath, environment);
}

function shouldIgnoreBasedOnGlobs(name, relativeParentPath, environment) {
    const relativePath = path.join(relativeParentPath, name);

    for (const ignoredGlob of environment.options.ignore) {
        if (minimatch(relativePath, ignoredGlob)) {
            return true;
        }
    }

    return false;
}
