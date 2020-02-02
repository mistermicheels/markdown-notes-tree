module.exports = { getNewMainReadmeFileContents, getDirectoryReadmeFileContents };

function getNewMainReadmeFileContents(currentContents, markdownForTree, endOfLine) {
    const treeStartMarker = "<!-- auto-generated notes tree starts here -->";
    const treeEndMarker = "<!-- auto-generated notes tree ends here -->";

    const indexOfStartMarker = currentContents.indexOf(treeStartMarker);
    const indexOfEndMarker = currentContents.indexOf(treeEndMarker);

    let contentsBeforeStartMarker;
    let contentsAfterEndMarker;

    if (indexOfStartMarker >= 0) {
        contentsBeforeStartMarker = currentContents.substring(0, indexOfStartMarker);
    } else {
        contentsBeforeStartMarker = currentContents + endOfLine.repeat(2);
    }

    if (indexOfEndMarker >= 0) {
        contentsAfterEndMarker = currentContents.substring(indexOfEndMarker + treeEndMarker.length);
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

function getDirectoryReadmeFileContents(name, markdownForTree, endOfLine) {
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
