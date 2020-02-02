"use strict";

const path = require("path");
const fs = require("fs");

const pathUtils = require("./path-utils");
const ignores = require("./ignores");
const fileContents = require("./file-contents");

module.exports = { buildTree };

function buildTree(options) {
    return buildTreeStartingAt("", options);
}

function buildTreeStartingAt(relativePath, options) {
    const absolutePath = pathUtils.getAbsolutePath(relativePath);
    const entries = fs.readdirSync(absolutePath, { withFileTypes: true });
    const directories = entries.filter(entry => entry.isDirectory());
    const files = entries.filter(entry => !entry.isDirectory());

    const treeNodesForDirectories = getTreeNodesForDirectories(directories, relativePath, options);
    const treeNodesForFiles = getTreeNodesForFiles(files, relativePath, options);

    return [...treeNodesForDirectories, ...treeNodesForFiles];
}

function getTreeNodesForDirectories(directories, relativeParentPath, options) {
    const treeNodes = [];

    for (const directory of directories) {
        if (!ignores.shouldIgnoreDirectory(directory.name, relativeParentPath, options)) {
            const relativePath = path.join(relativeParentPath, directory.name);

            treeNodes.push({
                isDirectory: true,
                title: directory.name,
                filename: directory.name,
                children: buildTreeStartingAt(relativePath, options)
            });
        }
    }

    return treeNodes;
}

function getTreeNodesForFiles(files, relativeParentPath, options) {
    const treeNodes = [];

    for (const file of files) {
        if (!ignores.shouldIgnoreFile(file.name, relativeParentPath, options)) {
            treeNodes.push({
                isDirectory: false,
                title: getTitleFromMarkdownFileOrThrow(path.join(relativeParentPath, file.name)),
                filename: file.name
            });
        }
    }

    if (options.orderNotesByTitle) {
        treeNodes.sort((a, b) => a.title.localeCompare(b.title, "en", { sensitivity: "base" }));
    }

    return treeNodes;
}

function getTitleFromMarkdownFileOrThrow(relativePath) {
    const absolutePath = pathUtils.getAbsolutePath(relativePath);
    const contents = fs.readFileSync(absolutePath, { encoding: "utf-8" });
    const title = fileContents.getTitleFromMarkdownContents(contents);

    if (!title) {
        throw new Error(`No title found for Markdown file ${absolutePath}`);
    }

    return title;
}
