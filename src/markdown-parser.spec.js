const markdownParser = require("./markdown-parser");

describe("markdownParser", () => {
    test("it can find level 1 headings", () => {
        const markdown = "# Test";
        const astNode = markdownParser.getAstNodeFromMarkdown(markdown);
        const level1Heading = markdownParser.getFirstLevel1HeadingChild(astNode);

        expect(markdownParser.getStartIndex(level1Heading)).toBe(0);
        expect(markdownParser.getEndIndex(level1Heading)).toBe(6);
    });

    test("it can find HTML comments", () => {
        const markdown = "# Test\n<!-- this was a test -->";
        const astNode = markdownParser.getAstNodeFromMarkdown(markdown);

        const htmlComment = markdownParser.getFirstHtmlChildWithValue(
            "<!-- this was a test -->",
            astNode
        );

        expect(markdownParser.getStartIndex(htmlComment)).toBe(7);
        expect(markdownParser.getEndIndex(htmlComment)).toBe(31);
    });

    describe("hasLinkDescendant", () => {
        test("it ignores non-link content", () => {
            const markdown = "# Test";
            const astNode = markdownParser.getAstNodeFromMarkdown(markdown);
            const level1Heading = markdownParser.getFirstLevel1HeadingChild(astNode);

            expect(markdownParser.hasLinkDescendant(level1Heading)).toBe(false);
        });

        test("it detects links", () => {
            const markdown = "# [mistermicheels](http://mistermicheels.com)";
            const astNode = markdownParser.getAstNodeFromMarkdown(markdown);
            const level1Heading = markdownParser.getFirstLevel1HeadingChild(astNode);

            expect(markdownParser.hasLinkDescendant(level1Heading)).toBe(true);
        });

        test("it detects links nested inside other nodes", () => {
            const markdown = "# **[mistermicheels](http://mistermicheels.com)**";
            const astNode = markdownParser.getAstNodeFromMarkdown(markdown);
            const level1Heading = markdownParser.getFirstLevel1HeadingChild(astNode);

            expect(markdownParser.hasLinkDescendant(level1Heading)).toBe(true);
        });

        test("it handles nodes without children", () => {
            const markdown = "# ";
            const astNode = markdownParser.getAstNodeFromMarkdown(markdown);
            const level1Heading = markdownParser.getFirstLevel1HeadingChild(astNode);

            expect(markdownParser.hasLinkDescendant(level1Heading)).toBe(false);
        });
    });

    describe("removeStrongFromMarkdown", () => {
        test("it removes strong content at the top", () => {
            const input = "**Look at me, I'm strong**";
            const expected = "Look at me, I'm strong";
            expect(markdownParser.removeStrongFromMarkdown(input)).toBe(expected);
        });

        test("it removes strong content inside other content", () => {
            const input = "> Look at **me**, I'm **strong**";
            const expected = "> Look at me, I'm strong";
            expect(markdownParser.removeStrongFromMarkdown(input)).toBe(expected);
        });

        test("it removes nested strong content", () => {
            const input = "**Look at **me**, I'm **strong****";
            const expected = "Look at me, I'm strong";
            expect(markdownParser.removeStrongFromMarkdown(input)).toBe(expected);
        });

        test("it ignores non-strong content", () => {
            const input = "*This* doesn't look `very strong`";
            const expected = "*This* doesn't look `very strong`";
            expect(markdownParser.removeStrongFromMarkdown(input)).toBe(expected);
        });
    });

    describe("escapeText", () => {
        test("it doesn't change normal text", () => {
            const input = "Well, what are you looking at?";
            const expected = "Well, what are you looking at?";
            expect(markdownParser.escapeText(input)).toBe(expected);
        });

        test("it escapes Markdown special characters", () => {
            const input = "> Well, _what_ **are** *you* looking __at__?";
            const expected = "\\> Well, \\_what\\_ \\*\\*are\\*\\* \\*you\\* looking \\__at\\_\\_?";
            expect(markdownParser.escapeText(input)).toBe(expected);
        });
    });
});
