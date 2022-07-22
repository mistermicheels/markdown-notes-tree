"use strict";

const path = require("path");
const fs = require("fs");

const pathUtils = require("./path-utils");
const fileContents = require("./file-contents");
const treeMarkdownGenerator = require("./tree-markdown-generator");

module.exports = { writeTreeToMainReadme, writeTreesForDirectories };

function writeTreeToMainReadme(tree, environment) {
    const mainReadmePath = pathUtils.getAbsolutePath(environment.options.readmeFilename);
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
                treeNode.titleParagraph,
                treeNode.children,
                environment
            );
        }
    }
}

function writeTreesForDirectory(pathParts, titleParagraph, treeForDirectory, environment) {
    writeTreeToDirectoryReadme(pathParts, titleParagraph, treeForDirectory, environment);

    for (const treeNode of treeForDirectory) {
        if (treeNode.isDirectory) {
            writeTreesForDirectory(
                [...pathParts, treeNode.filename],
                treeNode.titleParagraph,
                treeNode.children,
                environment
            );
        }
    }
}

function writeTreeToDirectoryReadme(pathParts, titleParagraph, treeForDirectory, environment) {
    const upwardNavigationPaths = getUpwardNavigationPaths(pathParts, environment);

    const filePathParts = [...pathParts, environment.options.readmeFilename];
    const relativeFilePath = path.join(...filePathParts);
    const absoluteFilePath = pathUtils.getAbsolutePath(relativeFilePath);

    let currentContents = "";

    if (fs.existsSync(absoluteFilePath)) {
        currentContents = fs.readFileSync(absoluteFilePath, { encoding: "utf-8" });
    }

    const markdownForTree = treeMarkdownGenerator.getMarkdownForTree(treeForDirectory, environment);

    const newContents = fileContents.getNewDirectoryReadmeContents(
        titleParagraph,
        upwardNavigationPaths,
        currentContents,
        markdownForTree,
        environment
    );

    environment.logger(`Writing to ${absoluteFilePath}`);
    fs.writeFileSync(absoluteFilePath, newContents, { encoding: "utf-8" });
}

function getUpwardNavigationPaths(pathParts, environment) {
    const numberLevels = pathParts.length;
    const oneLevelUp = "..";

    const toTopLevel = Array(numberLevels)
        .fill(oneLevelUp)
        .join("/");

    if (environment.options.linkToSubdirectoryReadme) {
        return {
            oneLevelUp: oneLevelUp + "/" + environment.options.readmeFilename,
            toTopLevel: toTopLevel + "/" + environment.options.readmeFilename
        };
    }

    return { oneLevelUp, toTopLevel };
}
