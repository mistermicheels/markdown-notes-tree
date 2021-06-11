"use strict";

const mdastUtilFromMarkdown = require("mdast-util-from-markdown");

module.exports = {
    getAstNodeFromContents,
    getFirstLevel1HeadingChild,
    isContentAllowedInsideLink,
    getFirstHtmlChildWithValue,
    getStartIndex,
    getEndIndex,
    getContentStartIndex,
    getContentEndIndex
};

// allowed types according to mdast spec: Break | Emphasis | HTML | Image | ImageReference | InlineCode | Strong | Text
const allowedTypesInsideLink = new Set([
    "break",
    "emphasis",
    "html",
    "image",
    "imageReference",
    "inlineCode",
    "strong",
    "text"
]);

const mdastCache = new Map();

function getAstNodeFromContents(contents) {
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

function isContentAllowedInsideLink(node) {
    if (!node.children) {
        return true;
    }

    return node.children.every(child => {
        if (!allowedTypesInsideLink.has(child.type)) {
            return false;
        }

        return isContentAllowedInsideLink(child);
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
