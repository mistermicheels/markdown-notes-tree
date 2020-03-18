"use strict";

module.exports = {
    getMarkdownForTree
};

function getMarkdownForTree(tree, endOfLine, options) {
    const lines = getMarkdownLinesForTree(tree, [], endOfLine, options);
    return lines.join(endOfLine);
}

function getMarkdownLinesForTree(tree, parentPathParts, endOfLine, options) {
    const markdownLines = [];
    const indentationUnit = getIndentationUnit(options);

    for (const treeNode of tree) {
        const markdownForTreeNode = getMarkdownForTreeNode(
            treeNode,
            parentPathParts,
            endOfLine,
            options
        );

        markdownLines.push(...markdownForTreeNode.split(endOfLine));

        if (treeNode.isDirectory) {
            const fullPathParts = [...parentPathParts, treeNode.filename];

            const linesForChildren = getMarkdownLinesForTree(
                treeNode.children,
                fullPathParts,
                endOfLine,
                options
            );

            const indentedLines = linesForChildren.map(line => indentationUnit + line);
            markdownLines.push(...indentedLines);
        }
    }

    return markdownLines;
}

function getIndentationUnit(options) {
    // Markdown standard: either four spaces or tabs
    if (options.useTabs) {
        return "\t";
    } else {
        return " ".repeat(4);
    }
}

function getMarkdownForTreeNode(treeNode, parentPath, endOfLine, options) {
    const linkText = getLinkTextForTreeNode(treeNode);
    const linkTarget = getLinkTargetForTreeNode(treeNode, parentPath, options);

    const basicLine = `- [${linkText}](${linkTarget})`;

    if (treeNode.description) {
        const descriptionSeparator = getDescriptionSeparator(endOfLine, options);
        return basicLine + descriptionSeparator + treeNode.description;
    } else {
        return basicLine;
    }
}

function getLinkTextForTreeNode(treeNode) {
    if (treeNode.isDirectory) {
        return `**${treeNode.title}**`;
    } else {
        return treeNode.title;
    }
}

function getLinkTargetForTreeNode(treeNode, parentPathParts, options) {
    const fullPathParts = [...parentPathParts, treeNode.filename];
    let linkTarget = fullPathParts.join("/");

    if (treeNode.isDirectory && options.linkToSubdirectoryReadme) {
        linkTarget = linkTarget + "/README.md";
    }

    return linkTarget;
}

function getDescriptionSeparator(endOfLine, options) {
    if (options.subdirectoryDescriptionOnNewLine) {
        return "  " + endOfLine + getIndentationUnit(options);
    } else {
        return " - ";
    }
}
