"use strict";

const mdastUtilFromMarkdown = require("mdast-util-from-markdown");
const mdastUtilToMarkdown = require("mdast-util-to-markdown");

module.exports = {
    getAstNodeFromMarkdown,
    getFirstLevel1HeadingChild,
    hasLinkDescendant,
    getFirstHtmlChildWithValue,
    getAllHtmlChildrenWithValues,
    getStartIndex,
    getEndIndex,
    extractParagraphFromHeadingNode,
    isSingleMarkdownParagraph,
    removeStrongFromMarkdown,
    escapeText,
    generateLinkFromMarkdownParagraphAndUrl,
    generateStrongParagraphFromMarkdownParagraph,
    generateLevel1HeadingFromMarkdownParagraph
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
    const allHtmlChildrenWithValue = getAllHtmlChildrenWithValues([value], node);
    return allHtmlChildrenWithValue[0];
}

function getAllHtmlChildrenWithValues(values, node) {
    if (!node.children) {
        return [];
    }

    return node.children.filter(node => node.type === "html" && values.includes(node.value));
}

function getStartIndex(node) {
    return node.position.start.offset;
}

function getEndIndex(node) {
    return node.position.end.offset;
}

function extractParagraphFromHeadingNode(node) {
    if (node.type !== "heading") {
        throw new Error("Provided node must be a heading");
    }

    const extracted = {
        type: "root",
        children: [
            {
                type: "paragraph",
                children: node.children.map(markAsGenerated)
            }
        ]
    };

    return mdastUtilToMarkdown(extracted).trim();
}

function isSingleMarkdownParagraph(markdown) {
    const node = getAstNodeFromMarkdown(markdown);
    return node.children.length === 1 && node.children[0].type === "paragraph";
}

/**
 * Note: this might alter other Markdown formatting syntax (for example, * vs _ for emphasis)
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

function escapeText(text) {
    const generated = {
        type: "root",
        children: [
            {
                type: "paragraph",
                children: [
                    {
                        type: "text",
                        value: text
                    }
                ]
            }
        ]
    };

    return mdastUtilToMarkdown(generated).trim();
}

function generateLinkFromMarkdownParagraphAndUrl(markdown, url) {
    if (!isSingleMarkdownParagraph(markdown)) {
        throw new Error("Link text must be a single paragraph");
    }

    const node = getAstNodeFromMarkdown(markdown);
    const paragraphNode = node.children[0];

    const generated = {
        type: "root",
        children: [
            {
                type: "paragraph",
                children: [
                    {
                        type: "link",
                        url: url,
                        children: paragraphNode.children.map(markAsGenerated)
                    }
                ]
            }
        ]
    };

    return mdastUtilToMarkdown(generated).trim();
}

function generateStrongParagraphFromMarkdownParagraph(markdown) {
    if (!isSingleMarkdownParagraph(markdown)) {
        throw new Error("Paragraph text must be a single paragraph");
    }

    const node = getAstNodeFromMarkdown(markdown);
    const paragraphNode = node.children[0];

    const generated = {
        type: "root",
        children: [
            {
                type: "paragraph",
                children: [
                    {
                        type: "strong",
                        children: paragraphNode.children.map(markAsGenerated)
                    }
                ]
            }
        ]
    };

    return mdastUtilToMarkdown(generated).trim();
}

function generateLevel1HeadingFromMarkdownParagraph(markdown) {
    if (!isSingleMarkdownParagraph(markdown)) {
        throw new Error("Heading text must be a single paragraph");
    }

    const node = getAstNodeFromMarkdown(markdown);
    const paragraphNode = node.children[0];

    const generated = {
        type: "root",
        children: [
            {
                type: "heading",
                depth: 1,
                children: paragraphNode.children.map(markAsGenerated)
            }
        ]
    };

    return mdastUtilToMarkdown(generated).trim();
}

function markAsGenerated(node) {
    return {
        ...node,
        position: undefined, // position must not be defined for generated/altered node
        children: node.children ? node.children.map(markAsGenerated) : undefined
    };
}
