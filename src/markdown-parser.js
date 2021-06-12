"use strict";

const mdastUtilFromMarkdown = require("mdast-util-from-markdown");

module.exports = {
    getAstNodeFromMarkdown,
    getFirstLevel1HeadingChild,
    hasLinkDescendant,
    getFirstHtmlChildWithValue,
    getStartIndex,
    getEndIndex,
    getContentStartIndex,
    getContentEndIndex
};

const mdastCache = new Map();

function getAstNodeFromMarkdown(contents) {
    if (mdastCache.has(contents)) {
        return mdastCache.get(contents);
    }

    // note that this should never fail for any kind of string, as all strings are valid Markdown
    const mdast = mdastUtilFromMarkdown(contents);
    mdastCache.set(contents, mdast);
    return mdast;
}

function getFirstLevel1HeadingChild(node) {
    if (!node.children) {
        return undefined;
    }

    return node.children.find(node => node.type === "heading" && node.depth === 1);
}

function hasLinkDescendant(node) {
    if (!node.children) {
        return false;
    }

    return node.children.some(child => {
        if (child.type === "link") {
            return true;
        }

        return hasLinkDescendant(child);
    });
}

function getFirstHtmlChildWithValue(value, node) {
    if (!node.children) {
        return undefined;
    }

    return node.children.find(node => node.type === "html" && node.value === value);
}

function getStartIndex(node) {
    return node.position.start.offset;
}

function getEndIndex(node) {
    return node.position.end.offset;
}

function getContentStartIndex(node) {
    if (!node.children || !node.children.length) {
        return getEndIndex(node);
    }

    const firstChild = node.children[0];
    return getStartIndex(firstChild);
}

function getContentEndIndex(node) {
    if (!node.children || !node.children.length) {
        return getEndIndex(node);
    }

    const lastChild = node.children[node.children.length - 1];
    return getEndIndex(lastChild);
}
