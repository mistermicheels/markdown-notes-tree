"use strict";

const path = require("path");

module.exports = { getAbsolutePath };

function getAbsolutePath(relativePath) {
    return path.join(process.cwd(), relativePath);
}
