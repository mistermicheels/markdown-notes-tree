"use strict";

const path = require("path");
const fs = require("fs");
const os = require("os");

const optionsFunctions = require("./options");
const ignoresFunctions = require("./ignores");
const fileContentsFunctions = require("./file-contents");

// keep these globally instead of passing into virtually every function
const endOfLine = os.EOL;
const baseDirectoryPath = process.cwd();
const options = optionsFunctions.getOptions(process.argv.slice(2));

execute();

function execute() {
    console.log("Processing files in order to build notes tree");
    const tree = buildTree();
    console.log("Writing notes tree to main README file");
    writeTreeToMainReadme(tree);

    if (!options.noSubdirectoryTrees) {
        console.log("Writing trees for directories");
        writeTreesForDirectories(tree);
    }

    console.log("Finished execution");
}

function buildTree() {
    return buildTreeStartingAt("");
}

function buildTreeStartingAt(relativePath) {
    const entries = fs.readdirSync(getAbsolutePath(relativePath), { withFileTypes: true });
    const directories = entries.filter(entry => entry.isDirectory());
    const files = entries.filter(entry => !entry.isDirectory());

    const treeNodesForDirectories = getTreeNodesForDirectories(directories, relativePath);
    const treeNodesForFiles = getTreeNodesForFiles(files, relativePath);

    return [...treeNodesForDirectories, ...treeNodesForFiles];
}

function getAbsolutePath(relativePath) {
    return path.join(baseDirectoryPath, relativePath);
}

function getTreeNodesForDirectories(directories, relativeParentPath) {
    const treeNodes = [];

    for (const directory of directories) {
        if (!ignoresFunctions.shouldIgnoreDirectory(directory.name, relativeParentPath, options)) {
            treeNodes.push({
                isDirectory: true,
                title: directory.name,
                filename: directory.name,
                children: buildTreeStartingAt(path.join(relativeParentPath, directory.name))
            });
        }
    }

    return treeNodes;
}

function getTreeNodesForFiles(files, relativeParentPath) {
    const treeNodes = [];

    for (const file of files) {
        if (!ignoresFunctions.shouldIgnoreFile(file.name, relativeParentPath, options)) {
            treeNodes.push({
                isDirectory: false,
                title: getTitleFromMarkdownFile(path.join(relativeParentPath, file.name)),
                filename: file.name
            });
        }
    }

    if (options.orderNotesByTitle) {
        treeNodes.sort((a, b) => a.title.localeCompare(b.title, "en", { sensitivity: "base" }));
    }

    return treeNodes;
}

function getTitleFromMarkdownFile(relativePath) {
    const absolutePath = getAbsolutePath(relativePath);
    const fullContents = fs.readFileSync(absolutePath, { encoding: "utf-8" });
    const firstLine = fullContents.split(/\r\n|\r|\n/, 1)[0];

    if (!firstLine.startsWith("# ")) {
        throw new Error(`No title found for Markdown file ${absolutePath}`);
    }

    return firstLine.substring(2);
}

function writeTreeToMainReadme(tree) {
    const mainReadmePath = path.join(baseDirectoryPath, "README.md");
    const currentContents = fs.readFileSync(mainReadmePath, { encoding: "utf-8" });
    const markdownForTree = getMarkdownForTree(tree);

    const newContents = fileContentsFunctions.getNewMainReadmeFileContents(
        currentContents,
        markdownForTree,
        endOfLine
    );

    fs.writeFileSync(mainReadmePath, newContents);
}

function getMarkdownForTree(tree) {
    return getMarkdownLinesForTree(tree, []).join(endOfLine);
}

function getMarkdownLinesForTree(tree, parentPath) {
    const markdownLines = [];
    const indentationUnit = getIndentationUnit();

    for (const treeNode of tree) {
        markdownLines.push(getMarkdownLineForTreeNode(treeNode, parentPath));

        if (treeNode.isDirectory) {
            const fullPath = getFullPath(parentPath, treeNode.filename);
            const markdownLinesForChildren = getMarkdownLinesForTree(treeNode.children, fullPath);
            markdownLines.push(...markdownLinesForChildren.map(line => indentationUnit + line));
        }
    }

    return markdownLines;
}

function getIndentationUnit() {
    // Markdown standard: either four spaces or tabs
    if (options.useTabs) {
        return "\t";
    } else {
        return " ".repeat(4);
    }
}

function getMarkdownLineForTreeNode(treeNode, parentPath) {
    const linkText = getLinkTextForTreeNode(treeNode);
    const linkTarget = getLinkTargetForTreeNode(treeNode, parentPath);
    return `- [${linkText}](${linkTarget})`;
}

function getLinkTextForTreeNode(treeNode) {
    if (treeNode.isDirectory) {
        return `**${treeNode.title}**`;
    } else {
        return treeNode.title;
    }
}

function getLinkTargetForTreeNode(treeNode, parentPath) {
    const fullPath = getFullPath(parentPath, treeNode.filename);
    let linkTarget = fullPath.join("/");

    if (treeNode.isDirectory && options.linkToSubdirectoryReadme) {
        linkTarget = linkTarget + "/README.md";
    }

    return linkTarget;
}

function getFullPath(parentPath, filename) {
    return [...parentPath, filename];
}

function writeTreesForDirectories(mainTree) {
    for (const treeNode of mainTree) {
        if (treeNode.isDirectory) {
            writeTreesForDirectoryAndChildren([], treeNode.filename, treeNode.children);
        }
    }
}

function writeTreesForDirectoryAndChildren(parentPath, name, treeForDirectory) {
    writeTreeToDirectoryReadmeFile(parentPath, name, treeForDirectory);

    for (const treeNode of treeForDirectory) {
        if (treeNode.isDirectory) {
            writeTreesForDirectoryAndChildren(
                getFullPath(parentPath, name),
                treeNode.filename,
                treeNode.children
            );
        }
    }
}

function writeTreeToDirectoryReadmeFile(parentPath, name, treeForDirectory) {
    const markdownForTree = getMarkdownForTree(treeForDirectory);

    const fileContents = fileContentsFunctions.getDirectoryReadmeFileContents(
        name,
        markdownForTree,
        endOfLine
    );

    const directoryPath = getFullPath(parentPath, name);
    const filePath = path.join(baseDirectoryPath, ...directoryPath, "README.md");

    console.log(`Writing to ${filePath}`);
    fs.writeFileSync(filePath, fileContents);
}
