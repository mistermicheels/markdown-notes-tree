"use strict";

module.exports = {
    getTitleFromMarkdownContents,
    getMarkdownForTree,
    getNewMainReadmeContents,
    getDirectoryReadmeContents
};

function getTitleFromMarkdownContents(contents) {
    const firstLine = contents.split(/\r\n|\r|\n/, 1)[0];

    if (firstLine.startsWith("# ")) {
        return firstLine.substring(2);
    } else {
        return undefined;
    }
}

function getMarkdownForTree(tree, endOfLine, { linkToSubdirectoryReadme, useTabs }) {
    const lines = getMarkdownLinesForTree(tree, [], { linkToSubdirectoryReadme, useTabs });
    return lines.join(endOfLine);
}

function getMarkdownLinesForTree(tree, parentPathParts, { linkToSubdirectoryReadme, useTabs }) {
    const markdownLines = [];
    const indentationUnit = getIndentationUnit({ useTabs });

    for (const treeNode of tree) {
        markdownLines.push(
            getMarkdownLineForTreeNode(treeNode, parentPathParts, { linkToSubdirectoryReadme })
        );

        if (treeNode.isDirectory) {
            const fullPathParts = [...parentPathParts, treeNode.filename];

            const linesForChildren = getMarkdownLinesForTree(treeNode.children, fullPathParts, {
                linkToSubdirectoryReadme,
                useTabs
            });

            const indentedLines = linesForChildren.map(line => indentationUnit + line);
            markdownLines.push(...indentedLines);
        }
    }

    return markdownLines;
}

function getIndentationUnit({ useTabs }) {
    // Markdown standard: either four spaces or tabs
    if (useTabs) {
        return "\t";
    } else {
        return " ".repeat(4);
    }
}

function getMarkdownLineForTreeNode(treeNode, parentPath, { linkToSubdirectoryReadme }) {
    const linkText = getLinkTextForTreeNode(treeNode);
    const linkTarget = getLinkTargetForTreeNode(treeNode, parentPath, { linkToSubdirectoryReadme });
    return `- [${linkText}](${linkTarget})`;
}

function getLinkTextForTreeNode(treeNode) {
    if (treeNode.isDirectory) {
        return `**${treeNode.title}**`;
    } else {
        return treeNode.title;
    }
}

function getLinkTargetForTreeNode(treeNode, parentPathParts, { linkToSubdirectoryReadme }) {
    const fullPathParts = [...parentPathParts, treeNode.filename];
    let linkTarget = fullPathParts.join("/");

    if (treeNode.isDirectory && linkToSubdirectoryReadme) {
        linkTarget = linkTarget + "/README.md";
    }

    return linkTarget;
}

function getNewMainReadmeContents(currentContents, markdownForTree, endOfLine) {
    const treeStartMarker = "<!-- auto-generated notes tree starts here -->";
    const treeEndMarker = "<!-- auto-generated notes tree ends here -->";

    const indexStartMarker = currentContents.indexOf(treeStartMarker);
    let contentsBeforeStartMarker;

    if (indexStartMarker >= 0) {
        contentsBeforeStartMarker = currentContents.substring(0, indexStartMarker);
    } else {
        contentsBeforeStartMarker = currentContents + endOfLine.repeat(2);
    }

    const indexEndMarker = currentContents.indexOf(treeEndMarker);
    let contentsAfterEndMarker;

    if (indexEndMarker >= 0 && indexEndMarker < indexStartMarker) {
        throw new Error("Invalid file structure: tree end marker found before tree start marker");
    } else if (indexEndMarker >= 0) {
        contentsAfterEndMarker = currentContents.substring(indexEndMarker + treeEndMarker.length);
    } else {
        contentsAfterEndMarker = endOfLine;
    }

    return (
        contentsBeforeStartMarker +
        treeStartMarker +
        endOfLine.repeat(2) +
        markdownForTree +
        endOfLine.repeat(2) +
        treeEndMarker +
        contentsAfterEndMarker
    );
}

function getNewMainReadmeContentsAfterEndMarker(currentContents, indexStartMarker, endOfLine) {}

function getDirectoryReadmeContents(name, markdownForTree, endOfLine) {
    const autoGenerationComment = "<!-- this entire file is auto-generated -->";
    const title = `# ${name}`;

    return (
        autoGenerationComment +
        endOfLine.repeat(2) +
        title +
        endOfLine.repeat(2) +
        markdownForTree +
        endOfLine
    );
}
