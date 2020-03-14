"use strict";

module.exports = {
    getTitleFromMarkdownContents,
    getMarkdownForTree,
    getNewMainReadmeContents,
    getNewDirectoryReadmeContents,
    getDirectoryDescriptionFromCurrentContents
};

const markers = {
    mainReadmeTreeStart: "<!-- auto-generated notes tree starts here -->",
    mainReadmeTreeEnd: "<!-- auto-generated notes tree ends here -->",
    directoryReadmeGeneratedStart: "<!-- this entire file is auto-generated -->",
    directoryReadmeDescriptionStart:
        "<!-- optional markdown-notes-tree directory description starts here -->",
    directoryReadmeDescriptionEnd:
        "<!-- optional markdown-notes-tree directory description ends here -->"
};

function getTitleFromMarkdownContents(contents) {
    const firstLine = contents.split(/\r\n|\r|\n/, 1)[0];

    if (firstLine.startsWith("# ")) {
        return firstLine.substring(2);
    } else {
        return undefined;
    }
}

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

function getNewMainReadmeContents(currentContents, markdownForTree, endOfLine) {
    const indexTreeStartMarker = currentContents.indexOf(markers.mainReadmeTreeStart);
    let contentsBeforeTree;

    if (indexTreeStartMarker >= 0) {
        contentsBeforeTree = currentContents.substring(0, indexTreeStartMarker);
    } else {
        contentsBeforeTree = currentContents + endOfLine.repeat(2);
    }

    const indexTreeEndMarker = currentContents.indexOf(markers.mainReadmeTreeEnd);
    let contentsAfterTree;

    if (indexTreeEndMarker >= 0 && indexTreeEndMarker < indexTreeStartMarker) {
        throw new Error("Invalid file structure: tree end marker found before tree start marker");
    } else if (indexTreeEndMarker >= 0) {
        contentsAfterTree = currentContents.substring(
            indexTreeEndMarker + markers.mainReadmeTreeEnd.length
        );
    } else {
        contentsAfterTree = endOfLine;
    }

    return (
        contentsBeforeTree +
        markers.mainReadmeTreeStart +
        endOfLine.repeat(2) +
        markdownForTree +
        endOfLine.repeat(2) +
        markers.mainReadmeTreeEnd +
        contentsAfterTree
    );
}

function getNewDirectoryReadmeContents(name, currentContents, markdownForTree, endOfLine) {
    const title = `# ${name}`;
    const description = getDirectoryDescriptionFromCurrentContents(currentContents);

    let partBetweenDescriptionMarkers = endOfLine.repeat(2);

    if (description) {
        partBetweenDescriptionMarkers = endOfLine.repeat(2) + description + endOfLine.repeat(2);
    }

    return (
        markers.directoryReadmeGeneratedStart +
        endOfLine.repeat(2) +
        title +
        endOfLine.repeat(2) +
        markers.directoryReadmeDescriptionStart +
        partBetweenDescriptionMarkers +
        markers.directoryReadmeDescriptionEnd +
        endOfLine.repeat(2) +
        markdownForTree +
        endOfLine
    );
}

function getDirectoryDescriptionFromCurrentContents(currentContents) {
    const indexDescriptionStartMarker = currentContents.indexOf(
        markers.directoryReadmeDescriptionStart
    );

    const indexDescriptionEndMarker = currentContents.indexOf(
        markers.directoryReadmeDescriptionEnd
    );

    const validMarkers =
        indexDescriptionStartMarker >= 0 &&
        indexDescriptionEndMarker >= 0 &&
        indexDescriptionEndMarker > indexDescriptionStartMarker;

    if (validMarkers) {
        const descriptionStart =
            indexDescriptionStartMarker + markers.directoryReadmeDescriptionStart.length;

        const descriptionEnd = indexDescriptionEndMarker;

        return currentContents.substring(descriptionStart, descriptionEnd).trim();
    } else if (indexDescriptionStartMarker >= 0 || indexDescriptionEndMarker >= 0) {
        throw new Error(
            "Invalid file structure: only one description marker found or end marker found before start marker"
        );
    } else {
        return "";
    }
}
