"use strict";

const treeMarkdownGenerator = require("./tree-markdown-generator");

describe("treeMarkdownGenerator", () => {
    const endOfLine = "\n";

    describe("getMarkdownForTree", () => {
        const tree = [
            {
                isDirectory: true,
                titleParagraph: "sub1",
                filename: "sub1",
                children: [
                    {
                        isDirectory: false,
                        titleParagraph: "Title for file1a",
                        filename: "file1a.md"
                    }
                ]
            }
        ];

        test("it should generate a tree with proper formatting and indentation", () => {
            const result = treeMarkdownGenerator.getMarkdownForTree(tree, {
                endOfLine,
                options: {
                    linkToSubdirectoryReadme: false,
                    useTabs: false
                }
            });

            const expected =
                "- [**sub1**](sub1)" + endOfLine + "    - [Title for file1a](sub1/file1a.md)";

            expect(result).toEqual(expected);
        });

        test("it should allow linking directly to subdirectory README files", () => {
            const result = treeMarkdownGenerator.getMarkdownForTree(tree, {
                endOfLine,
                options: {
                    linkToSubdirectoryReadme: true,
                    useTabs: false
                }
            });

            const expected =
                "- [**sub1**](sub1/README.md)" +
                endOfLine +
                "    - [Title for file1a](sub1/file1a.md)";

            expect(result).toEqual(expected);
        });

        test("it should allow using tabs instead of spaces", () => {
            const result = treeMarkdownGenerator.getMarkdownForTree(tree, {
                endOfLine,
                options: {
                    linkToSubdirectoryReadme: false,
                    useTabs: true
                }
            });

            const expected =
                "- [**sub1**](sub1)" + endOfLine + "\t- [Title for file1a](sub1/file1a.md)";

            expect(result).toEqual(expected);
        });

        describe("for a tree with description", () => {
            const treeIncludingFolderDescription = [
                {
                    isDirectory: true,
                    titleParagraph: "sub1",
                    descriptionParagraph: "description1",
                    filename: "sub1",
                    children: [
                        {
                            isDirectory: true,
                            titleParagraph: "sub1a",
                            descriptionParagraph: "description1a",
                            filename: "sub1a",
                            children: []
                        },
                        {
                            isDirectory: false,
                            titleParagraph: "Title for file1a",
                            filename: "file1a.md"
                        }
                    ]
                }
            ];

            test("it should include the description", () => {
                const result = treeMarkdownGenerator.getMarkdownForTree(
                    treeIncludingFolderDescription,
                    {
                        endOfLine,
                        options: {
                            linkToSubdirectoryReadme: false,
                            subdirectoryDescriptionOnNewLine: false,
                            useTabs: false
                        }
                    }
                );

                const expected =
                    "- [**sub1**](sub1) - description1" +
                    endOfLine +
                    "    - [**sub1a**](sub1/sub1a) - description1a" +
                    endOfLine +
                    "    - [Title for file1a](sub1/file1a.md)";

                expect(result).toEqual(expected);
            });

            test("it should allow putting the description on a new line", () => {
                const result = treeMarkdownGenerator.getMarkdownForTree(
                    treeIncludingFolderDescription,
                    {
                        endOfLine,
                        options: {
                            linkToSubdirectoryReadme: false,
                            subdirectoryDescriptionOnNewLine: true,
                            useTabs: false
                        }
                    }
                );

                const expected =
                    "- [**sub1**](sub1)  " +
                    endOfLine +
                    "    description1" +
                    endOfLine +
                    "    - [**sub1a**](sub1/sub1a)  " +
                    endOfLine +
                    "        description1a" +
                    endOfLine +
                    "    - [Title for file1a](sub1/file1a.md)";

                expect(result).toEqual(expected);
            });
        });
    });
});
