"use strict";

const path = require("path");
const fs = require("fs");
const os = require("os");

const optionsFunctions = require("./options");
const ignoresFunctions = require("./ignores");
const fileContentsFunctions = require("./file-contents");

// keep these globally instead of passing into virtually every function
const options = optionsFunctions.getOptions(process.argv.slice(2));

execute();

function execute() {
    const endOfLine = os.EOL;

    console.log("Processing files in order to build notes tree");
    const tree = buildTree();
    console.log("Writing notes tree to main README file");
    writeTreeToMainReadme(tree, endOfLine);

    if (!options.noSubdirectoryTrees) {
        console.log("Writing trees for directories");
        writeTreesForDirectories(tree, endOfLine);
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
    return path.join(process.cwd(), relativePath);
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
    const title = getTitleFromMarkdownContents(contents);

    if (!title) {
        throw new Error(`No title found for Markdown file ${absolutePath}`);
    }

    return title;
}

function getTitleFromMarkdownContents(contents) {
    const firstLine = contents.split(/\r\n|\r|\n/, 1)[0];

    if (firstLine.startsWith("# ")) {
        return firstLine.substring(2);
    } else {
        return undefined;
    }
}

function writeTreeToMainReadme(tree, endOfLine) {
    const mainReadmePath = getAbsolutePath("README.md");
    const currentContents = fs.readFileSync(mainReadmePath, { encoding: "utf-8" });
    const markdownForTree = getMarkdownForTree(tree, endOfLine);

    const newContents = fileContentsFunctions.getNewMainReadmeFileContents(
        currentContents,
        markdownForTree,
        endOfLine
    );

    fs.writeFileSync(mainReadmePath, newContents);
}

function getMarkdownForTree(tree, endOfLine) {
    return getMarkdownLinesForTree(tree, []).join(endOfLine);
}

function getMarkdownLinesForTree(tree, parentPathParts) {
    const markdownLines = [];
    const indentationUnit = getIndentationUnit();

    for (const treeNode of tree) {
        markdownLines.push(getMarkdownLineForTreeNode(treeNode, parentPathParts));

        if (treeNode.isDirectory) {
            const fullPathParts = [...parentPathParts, treeNode.filename];
            const linesForChildren = getMarkdownLinesForTree(treeNode.children, fullPathParts);
            const indentedLines = linesForChildren.map(line => indentationUnit + line);
            markdownLines.push(...indentedLines);
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

function getLinkTargetForTreeNode(treeNode, parentPathParts) {
    const fullPathParts = [...parentPathParts, treeNode.filename];
    let linkTarget = fullPathParts.join("/");

    if (treeNode.isDirectory && options.linkToSubdirectoryReadme) {
        linkTarget = linkTarget + "/README.md";
    }

    return linkTarget;
}

function writeTreesForDirectories(mainTree, endOfLine) {
    for (const treeNode of mainTree) {
        if (treeNode.isDirectory) {
            writeTreesForDirectoryAndChildren([], treeNode.filename, treeNode.children, endOfLine);
        }
    }
}

function writeTreesForDirectoryAndChildren(parentPathParts, name, treeForDirectory, endOfLine) {
    writeTreeToDirectoryReadmeFile(parentPathParts, name, treeForDirectory, endOfLine);

    for (const treeNode of treeForDirectory) {
        if (treeNode.isDirectory) {
            writeTreesForDirectoryAndChildren(
                [...parentPathParts, name],
                treeNode.filename,
                treeNode.children,
                endOfLine
            );
        }
    }
}

function writeTreeToDirectoryReadmeFile(parentPathParts, name, treeForDirectory, endOfLine) {
    const markdownForTree = getMarkdownForTree(treeForDirectory, endOfLine);

    const fileContents = fileContentsFunctions.getDirectoryReadmeFileContents(
        name,
        markdownForTree,
        endOfLine
    );

    const filePathParts = [...parentPathParts, name, "README.md"];
    const relativeFilePath = path.join(...filePathParts);
    const absoluteFilePath = getAbsolutePath(relativeFilePath);

    console.log(`Writing to ${absoluteFilePath}`);
    fs.writeFileSync(absoluteFilePath, fileContents);
}
