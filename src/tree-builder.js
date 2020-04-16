"use strict";

const path = require("path");
const fs = require("fs");

const pathUtils = require("./path-utils");
const stringUtils = require("./string-utils");
const ignores = require("./ignores");
const fileContents = require("./file-contents");

module.exports = { buildTree };

function buildTree(environment) {
    return buildTreeStartingAt("", environment);
}

function buildTreeStartingAt(relativePath, environment) {
    const absolutePath = pathUtils.getAbsolutePath(relativePath);
    const entries = fs.readdirSync(absolutePath, { withFileTypes: true });

    entries.sort((a, b) => stringUtils.compareIgnoringCaseAndDiacritics(a.name, b.name));
    const directories = entries.filter(entry => entry.isDirectory());
    const files = entries.filter(entry => !entry.isDirectory());

    const treeNodesForDirectories = getTreeNodesForDirectories(
        directories,
        relativePath,
        environment
    );

    const treeNodesForFiles = getTreeNodesForFiles(files, relativePath, environment);

    if (environment.options.notesBeforeDirectories) {
        return [...treeNodesForFiles, ...treeNodesForDirectories];
    } else {
        return [...treeNodesForDirectories, ...treeNodesForFiles];
    }
}

function getTreeNodesForDirectories(directories, relativeParentPath, environment) {
    const treeNodes = [];

    for (const directory of directories) {
        if (!ignores.shouldIgnoreDirectory(directory.name, relativeParentPath, environment)) {
            const relativePath = path.join(relativeParentPath, directory.name);

            treeNodes.push({
                isDirectory: true,
                title: directory.name,
                description: getDescriptionFromDirectoryReadme(relativePath),
                filename: directory.name,
                children: buildTreeStartingAt(relativePath, environment)
            });
        }
    }

    return treeNodes;
}

function getTreeNodesForFiles(files, relativeParentPath, environment) {
    const treeNodes = [];

    for (const file of files) {
        if (!ignores.shouldIgnoreFile(file.name, relativeParentPath, environment)) {
            const relativePath = path.join(relativeParentPath, file.name);

            treeNodes.push({
                isDirectory: false,
                title: getTitleFromMarkdownFileOrThrow(relativePath),
                filename: file.name
            });
        }
    }

    if (environment.options.orderNotesByTitle) {
        treeNodes.sort((a, b) => stringUtils.compareIgnoringCaseAndDiacritics(a.title, b.title));
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

function getDescriptionFromDirectoryReadme(relativeDirectoryPath) {
    const absolutePath = pathUtils.getAbsolutePath(path.join(relativeDirectoryPath, "README.md"));

    if (!fs.existsSync(absolutePath)) {
        return "";
    }

    let description;

    try {
        const contents = fs.readFileSync(absolutePath, { encoding: "utf-8" });
        description = fileContents.getDirectoryDescriptionFromCurrentContents(contents);
    } catch (error) {
        throw new Error(`Cannot get description from file ${absolutePath}: ${error.message}`);
    }

    return description;
}
