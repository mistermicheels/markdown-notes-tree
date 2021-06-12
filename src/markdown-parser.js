"use strict";

const mdastUtilFromMarkdown = require("mdast-util-from-markdown");
const mdastUtilToMarkdown = require("mdast-util-to-markdown");

module.exports = {
    getAstNodeFromMarkdown,
    getFirstLevel1HeadingChild,
    hasLinkDescendant,
    getFirstHtmlChildWithValue,
    getStartIndex,
    getEndIndex,
    getContentStartIndex,
    getContentEndIndex,
    removeStrongFromMarkdown
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

/**
 * Note: this might alter other Markdown formatting (for example, * vs _ for emphasis)
 */
function removeStrongFromMarkdown(markdown) {
    const node = getAstNodeFromMarkdown(markdown);
    const nodeWithoutStrong = replaceStrongDescendantsByChildren(node);
    return mdastUtilToMarkdown(nodeWithoutStrong).trim();
}

function replaceStrongDescendantsByChildren(node) {
    return {
        ...node,
        position: undefined, // position must not be defined for generated/altered node
        children: node.children ? replaceStrongNodesByChildrenDeep(node.children) : undefined
    };
}

function replaceStrongNodesByChildrenDeep(nodes) {
    const newNodes = [];

    for (const node of nodes) {
        if (node.type === "strong") {
            newNodes.push(...replaceStrongNodesByChildrenDeep(node.children));
        } else {
            newNodes.push(replaceStrongDescendantsByChildren(node));
        }
    }

    return newNodes;
}
