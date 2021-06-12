const markdownParser = require("./markdown-parser");

describe("markdownParser", () => {
    test("it can find level 1 headings", () => {
        const markdown = "# Test";
        const astNode = markdownParser.getAstNodeFromMarkdown(markdown);
        const level1Heading = markdownParser.getFirstLevel1HeadingChild(astNode);

        expect(markdownParser.getStartIndex(level1Heading)).toBe(0);
        expect(markdownParser.getEndIndex(level1Heading)).toBe(6);
        expect(markdownParser.getContentStartIndex(level1Heading)).toBe(2);
        expect(markdownParser.getContentEndIndex(level1Heading)).toBe(6);
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
        expect(markdownParser.getContentStartIndex(htmlComment)).toBe(31);
        expect(markdownParser.getContentEndIndex(htmlComment)).toBe(31);
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
});
