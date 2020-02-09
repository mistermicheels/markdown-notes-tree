"use strict";

const path = require("path");
const fs = require("fs");

const logger = require("./logger");
const pathUtils = require("./path-utils");
const fileContents = require("./file-contents");

module.exports = { writeTreeToMainReadme, writeTreesForDirectories };

function writeTreeToMainReadme(tree, endOfLine, options) {
    const mainReadmePath = pathUtils.getAbsolutePath("README.md");
    const currentContents = fs.readFileSync(mainReadmePath, { encoding: "utf-8" });
    const markdownForTree = fileContents.getMarkdownForTree(tree, endOfLine, options);

    const newContents = fileContents.getNewMainReadmeContents(
        currentContents,
        markdownForTree,
        endOfLine
    );

    fs.writeFileSync(mainReadmePath, newContents, { encoding: "utf-8" });
}

function writeTreesForDirectories(mainTree, endOfLine, options) {
    for (const treeNode of mainTree) {
        if (treeNode.isDirectory) {
            writeTreesForDirectory([], treeNode.filename, treeNode.children, endOfLine, options);
        }
    }
}

function writeTreesForDirectory(parentPathParts, name, treeForDirectory, endOfLine, options) {
    writeTreeToDirectoryReadme(parentPathParts, name, treeForDirectory, endOfLine, options);

    for (const treeNode of treeForDirectory) {
        if (treeNode.isDirectory) {
            writeTreesForDirectory(
                [...parentPathParts, name],
                treeNode.filename,
                treeNode.children,
                endOfLine,
                options
            );
        }
    }
}

function writeTreeToDirectoryReadme(parentPathParts, name, treeForDirectory, endOfLine, options) {
    const markdownForTree = fileContents.getMarkdownForTree(treeForDirectory, endOfLine, options);
    const contents = fileContents.getDirectoryReadmeContents(name, markdownForTree, endOfLine);

    const filePathParts = [...parentPathParts, name, "README.md"];
    const relativeFilePath = path.join(...filePathParts);
    const absoluteFilePath = pathUtils.getAbsolutePath(relativeFilePath);

    logger.log(`Writing to ${absoluteFilePath}`);
    fs.writeFileSync(absoluteFilePath, contents, { encoding: "utf-8" });
}
