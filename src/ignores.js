"use strict";

const minimatch = require("minimatch");
const path = require("path");

module.exports = { shouldIgnoreDirectory, shouldIgnoreFile };

function shouldIgnoreDirectory(name, relativeParentPath, { ignoredGlobs }) {
    if (name.startsWith(".") || name.startsWith("_") || name === "node_modules") {
        return true;
    }

    return shouldIgnoreBasedOnGlobs(name, relativeParentPath, ignoredGlobs);
}

function shouldIgnoreFile(name, relativeParentPath, { ignoredGlobs }) {
    if (!name.endsWith(".md") || name === "README.md") {
        return true;
    }

    return shouldIgnoreBasedOnGlobs(name, relativeParentPath, ignoredGlobs);
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
