"use strict";

const minimist = require("minimist");
const path = require("path");
const fs = require("fs");
const os = require("os");

const endOfLine = os.EOL;
const baseDirectoryPath = process.cwd();

// keep this globally instead of passing into virtually every function
const options = getOptions();

execute();

function getOptions() {
    const defaultOptions = {
        noSubdirectoryTrees: false,
        useTabs: false
    };

    const parsedArguments = minimist(process.argv.slice(2));

    return {
        ...defaultOptions,
        ...parsedArguments
    };
}

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
    return buildTreeStartingAt(baseDirectoryPath);
}

function buildTreeStartingAt(absolutePath) {
    const entries = fs.readdirSync(absolutePath, { withFileTypes: true });
    const directories = entries.filter(entry => entry.isDirectory());
    const files = entries.filter(entry => !entry.isDirectory());
    const tree = [];

    for (const directory of directories) {
        if (shouldIncludeDirectory(directory.name)) {
            tree.push({
                isDirectory: true,
                title: directory.name,
                filename: directory.name,
                children: buildTreeStartingAt(path.join(absolutePath, directory.name))
            });
        }
    }

    for (const file of files) {
        if (shouldIncludeFile(file.name)) {
            tree.push({
                isDirectory: false,
                title: getTitleFromMarkdownFile(path.join(absolutePath, file.name)),
                filename: file.name
            });
        }
    }

    return tree;
}

function shouldIncludeDirectory(name) {
    return !name.startsWith(".") && !name.startsWith("_") && name !== "node_modules";
}

function shouldIncludeFile(name) {
    return name.endsWith(".md") && name !== "README.md";
}

function getTitleFromMarkdownFile(absolutePath) {
    const fullContents = fs.readFileSync(absolutePath, { encoding: "utf-8" });
    const firstLine = fullContents.split(endOfLine, 1)[0];

    if (!firstLine.startsWith("# ")) {
        throw new Error(`No title found for Markdown file ${absolutePath}`);
    }

    return firstLine.substring(2);
}

function writeTreeToMainReadme(tree) {
    const mainReadmePath = path.join(baseDirectoryPath, "README.md");
    const currentReadmeContents = fs.readFileSync(mainReadmePath, { encoding: "utf-8" });
    const notesTreeMarker = "<!-- auto-generated notes tree starts here -->";
    const indexMarker = currentReadmeContents.indexOf(notesTreeMarker);

    let contentsBeforeMarker;

    if (indexMarker >= 0) {
        contentsBeforeMarker = currentReadmeContents.substring(0, indexMarker);
    } else {
        contentsBeforeMarker = currentReadmeContents + endOfLine.repeat(2);
    }

    const markdownForTree = getMarkdownForTree(tree);

    const newContents =
        contentsBeforeMarker + notesTreeMarker + endOfLine.repeat(2) + markdownForTree + endOfLine;

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
    const linkText = treeNode.isDirectory ? `**${treeNode.title}**` : treeNode.title;
    const fullPath = getFullPath(parentPath, treeNode.filename);
    const linkTarget = fullPath.join("/");
    return `- [${linkText}](${linkTarget})`;
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
    const autoGenerationComment = "<!-- this entire file is auto-generated -->";

    const title = `# ${name}`;

    const markdownForTree = getMarkdownForTree(treeForDirectory);

    const directoryPath = getFullPath(parentPath, name);
    const filePath = path.join(baseDirectoryPath, ...directoryPath, "README.md");

    console.log(`Writing to ${filePath}`);

    const fileContents =
        autoGenerationComment +
        endOfLine.repeat(2) +
        title +
        endOfLine.repeat(2) +
        markdownForTree +
        endOfLine;

    fs.writeFileSync(filePath, fileContents);
}
