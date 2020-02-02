"use strict";

const path = require("path");
const fs = require("fs");
const os = require("os");

const optionsParser = require("./options-parser");
const ignores = require("./ignores");
const fileContents = require("./file-contents");

execute();

function execute() {
    const endOfLine = os.EOL;

    const commandLineArguments = process.argv.slice(2);
    const options = optionsParser.getOptions(commandLineArguments);

    console.log("Processing files in order to build notes tree");
    const tree = buildTree(options);
    console.log("Writing notes tree to main README file");
    writeTreeToMainReadme(tree, endOfLine, options);

    if (!options.noSubdirectoryTrees) {
        console.log("Writing trees for directories");
        writeTreesForDirectories(tree, endOfLine, options);
    }

    console.log("Finished execution");
}

function buildTree(options) {
    return buildTreeStartingAt("", options);
}

function buildTreeStartingAt(relativePath, options) {
    const entries = fs.readdirSync(getAbsolutePath(relativePath), { withFileTypes: true });
    const directories = entries.filter(entry => entry.isDirectory());
    const files = entries.filter(entry => !entry.isDirectory());

    const treeNodesForDirectories = getTreeNodesForDirectories(directories, relativePath, options);
    const treeNodesForFiles = getTreeNodesForFiles(files, relativePath, options);

    return [...treeNodesForDirectories, ...treeNodesForFiles];
}

function getAbsolutePath(relativePath) {
    return path.join(process.cwd(), relativePath);
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
    const absolutePath = getAbsolutePath(relativePath);
    const contents = fs.readFileSync(absolutePath, { encoding: "utf-8" });
    const title = fileContents.getTitleFromMarkdownContents(contents);

    if (!title) {
        throw new Error(`No title found for Markdown file ${absolutePath}`);
    }

    return title;
}

function writeTreeToMainReadme(tree, endOfLine, options) {
    const mainReadmePath = getAbsolutePath("README.md");
    const currentContents = fs.readFileSync(mainReadmePath, { encoding: "utf-8" });
    const markdownForTree = fileContents.getMarkdownForTree(tree, endOfLine, options);

    const newContents = fileContents.getNewMainReadmeFileContents(
        currentContents,
        markdownForTree,
        endOfLine
    );

    fs.writeFileSync(mainReadmePath, newContents);
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
    const contents = fileContents.getDirectoryReadmeFileContents(name, markdownForTree, endOfLine);

    const filePathParts = [...parentPathParts, name, "README.md"];
    const relativeFilePath = path.join(...filePathParts);
    const absoluteFilePath = getAbsolutePath(relativeFilePath);

    console.log(`Writing to ${absoluteFilePath}`);
    fs.writeFileSync(absoluteFilePath, contents);
}
