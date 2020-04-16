"use strict";

const path = require("path");
const fs = require("fs");

const pathUtils = require("./path-utils");
const fileContents = require("./file-contents");
const treeMarkdownGenerator = require("./tree-markdown-generator");

module.exports = { writeTreeToMainReadme, writeTreesForDirectories };

function writeTreeToMainReadme(tree, environment) {
    const mainReadmePath = pathUtils.getAbsolutePath("README.md");
    const currentContents = fs.readFileSync(mainReadmePath, { encoding: "utf-8" });
    const markdownForTree = treeMarkdownGenerator.getMarkdownForTree(tree, environment);

    let newContents;

    try {
        newContents = fileContents.getNewMainReadmeContents(
            currentContents,
            markdownForTree,
            environment
        );
    } catch (error) {
        throw new Error(`Cannot get new contents for file ${mainReadmePath}: ${error.message}`);
    }

    fs.writeFileSync(mainReadmePath, newContents, { encoding: "utf-8" });
}

function writeTreesForDirectories(mainTree, environment) {
    for (const treeNode of mainTree) {
        if (treeNode.isDirectory) {
            writeTreesForDirectory(
                [treeNode.filename],
                treeNode.filename,
                treeNode.children,
                environment
            );
        }
    }
}

function writeTreesForDirectory(pathParts, name, treeForDirectory, environment) {
    writeTreeToDirectoryReadme(pathParts, name, treeForDirectory, environment);

    for (const treeNode of treeForDirectory) {
        if (treeNode.isDirectory) {
            writeTreesForDirectory(
                [...pathParts, treeNode.filename],
                treeNode.filename,
                treeNode.children,
                environment
            );
        }
    }
}

function writeTreeToDirectoryReadme(pathParts, name, treeForDirectory, environment) {
    const filePathParts = [...pathParts, "README.md"];
    const relativeFilePath = path.join(...filePathParts);
    const absoluteFilePath = pathUtils.getAbsolutePath(relativeFilePath);

    let currentContents = "";

    if (fs.existsSync(absoluteFilePath)) {
        currentContents = fs.readFileSync(absoluteFilePath, { encoding: "utf-8" });
    }

    const markdownForTree = treeMarkdownGenerator.getMarkdownForTree(treeForDirectory, environment);

    const newContents = fileContents.getNewDirectoryReadmeContents(
        name,
        currentContents,
        markdownForTree,
        environment
    );

    environment.logger(`Writing to ${absoluteFilePath}`);
    fs.writeFileSync(absoluteFilePath, newContents, { encoding: "utf-8" });
}
