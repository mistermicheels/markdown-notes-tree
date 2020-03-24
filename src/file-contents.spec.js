"use strict";

const dedent = require("dedent");

const fileContents = require("./file-contents");

describe("fileContents", () => {
    const endOfLine = "\n";

    describe("getTitleFromMarkdownContents", () => {
        test("it should support CRLF line endings", () => {
            const contents = "# test" + "\r\n" + "second line";
            expect(fileContents.getTitleFromMarkdownContents(contents)).toBe("test");
        });

        test("it should support LF line endings", () => {
            const contents = "# test" + "\n" + "second line";
            expect(fileContents.getTitleFromMarkdownContents(contents)).toBe("test");
        });

        test("it should support CR line endings", () => {
            const contents = "# test" + "\r" + "second line";
            expect(fileContents.getTitleFromMarkdownContents(contents)).toBe("test");
        });

        test("it should return undefined if the first line doesn't have a title", () => {
            const contents = "some non-title content";
            expect(fileContents.getTitleFromMarkdownContents(contents)).toBeUndefined();
        });
    });

    describe("getNewMainReadmeContents", () => {
        test("it should handle current contents without a tree", () => {
            const currentContents = "some content";

            const result = fileContents.getNewMainReadmeContents(
                currentContents,
                "markdownForTree",
                endOfLine
            );

            const expected =
                dedent(`some content
                
                <!-- tree generated by markdown-notes-tree starts here -->
                
                markdownForTree
                
                <!-- tree generated by markdown-notes-tree ends here -->`) + endOfLine;

            expect(result).toBe(expected);
        });

        test("it should handle current contents with a tree", () => {
            const currentContents =
                dedent(`some content
                
                <!-- tree generated by markdown-notes-tree starts here -->
                
                markdownForTree
                
                <!-- tree generated by markdown-notes-tree ends here -->
                
                content after tree`) + endOfLine;

            const result = fileContents.getNewMainReadmeContents(
                currentContents,
                "markdownForTree",
                endOfLine
            );

            const expected =
                dedent(`some content
                
                <!-- tree generated by markdown-notes-tree starts here -->
                
                markdownForTree
                
                <!-- tree generated by markdown-notes-tree ends here -->
                
                content after tree`) + endOfLine;

            expect(result).toBe(expected);
        });

        test("it should handle current contents with a tree and old markers (v1.8.0 and earlier)", () => {
            const currentContents =
                dedent(`some content
                
                <!-- auto-generated notes tree starts here -->
                
                markdownForTree
                
                <!-- auto-generated notes tree ends here -->
                
                content after tree`) + endOfLine;

            const result = fileContents.getNewMainReadmeContents(
                currentContents,
                "markdownForTree",
                endOfLine
            );

            const expected =
                dedent(`some content
                
                <!-- tree generated by markdown-notes-tree starts here -->
                
                markdownForTree
                
                <!-- tree generated by markdown-notes-tree ends here -->
                
                content after tree`) + endOfLine;

            expect(result).toBe(expected);
        });

        test("it should handle current contents with a tree at the end missing the end marker (as generated by older version)", () => {
            const currentContents =
                dedent(`some content
                
                <!-- tree generated by markdown-notes-tree starts here -->
                
                markdownForTree`) + endOfLine;

            const result = fileContents.getNewMainReadmeContents(
                currentContents,
                "markdownForTree",
                endOfLine
            );

            const expected =
                dedent(`some content
                
                <!-- tree generated by markdown-notes-tree starts here -->
                
                markdownForTree
                
                <!-- tree generated by markdown-notes-tree ends here -->`) + endOfLine;

            expect(result).toBe(expected);
        });

        test("it should fail for current contents having an end marker before start marker", () => {
            const currentContents =
                dedent(`some content

                <!-- tree generated by markdown-notes-tree ends here -->
                
                <!-- tree generated by markdown-notes-tree starts here -->
                
                markdownForTree`) + endOfLine;

            expect(() =>
                fileContents.getNewMainReadmeContents(currentContents, "markdownForTree", endOfLine)
            ).toThrow("Invalid file structure: tree end marker found before tree start marker");
        });

        test("it should fail for current contents having an end marker but no start marker", () => {
            const currentContents =
                dedent(`some content

                <!-- tree generated by markdown-notes-tree ends here -->
                
                markdownForTree`) + endOfLine;

            expect(() =>
                fileContents.getNewMainReadmeContents(currentContents, "markdownForTree", endOfLine)
            ).toThrow("Invalid file structure: tree end marker found before tree start marker");
        });
    });

    describe("getNewDirectoryReadmeContents", () => {
        test("it should handle empty current contents", () => {
            const currentContents = "";

            const result = fileContents.getNewDirectoryReadmeContents(
                "name",
                currentContents,
                "markdownForTree",
                endOfLine
            );

            const expected =
                dedent(`<!-- generated by markdown-notes-tree -->
                
                # name

                <!-- optional markdown-notes-tree directory description starts here -->

                <!-- optional markdown-notes-tree directory description ends here -->
                
                markdownForTree`) + endOfLine;

            expect(result).toBe(expected);
        });

        test("it should handle current contents without description markers (as generated by older version)", () => {
            const currentContents =
                dedent(`<!-- generated by markdown-notes-tree -->
                
                # name
                
                markdownForTree`) + endOfLine;

            const result = fileContents.getNewDirectoryReadmeContents(
                "name",
                currentContents,
                "markdownForTree",
                endOfLine
            );

            const expected =
                dedent(`<!-- generated by markdown-notes-tree -->
                
                # name

                <!-- optional markdown-notes-tree directory description starts here -->

                <!-- optional markdown-notes-tree directory description ends here -->
                
                markdownForTree`) + endOfLine;

            expect(result).toBe(expected);
        });

        test("it should handle current contents without description between markers", () => {
            const currentContents =
                dedent(`<!-- generated by markdown-notes-tree -->
                
                # name

                <!-- optional markdown-notes-tree directory description starts here -->

                <!-- optional markdown-notes-tree directory description ends here -->
                
                markdownForTree`) + endOfLine;

            const result = fileContents.getNewDirectoryReadmeContents(
                "name",
                currentContents,
                "markdownForTree",
                endOfLine
            );

            const expected =
                dedent(`<!-- generated by markdown-notes-tree -->
                
                # name

                <!-- optional markdown-notes-tree directory description starts here -->

                <!-- optional markdown-notes-tree directory description ends here -->
                
                markdownForTree`) + endOfLine;

            expect(result).toBe(expected);
        });

        test("it should handle current contents with description between markers", () => {
            const currentContents =
                dedent(`<!-- generated by markdown-notes-tree -->
                
                # name

                <!-- optional markdown-notes-tree directory description starts here -->

                This is a description.

                <!-- optional markdown-notes-tree directory description ends here -->
                
                markdownForTree`) + endOfLine;

            const result = fileContents.getNewDirectoryReadmeContents(
                "name",
                currentContents,
                "markdownForTree",
                endOfLine
            );

            const expected =
                dedent(`<!-- generated by markdown-notes-tree -->
                
                # name

                <!-- optional markdown-notes-tree directory description starts here -->

                This is a description.

                <!-- optional markdown-notes-tree directory description ends here -->
                
                markdownForTree`) + endOfLine;

            expect(result).toBe(expected);
        });

        test("it should handle current contents with description between markers and old start marker (v1.8.0 and earlier)", () => {
            const currentContents =
                dedent(`<!-- this entire file is auto-generated -->
                
                # name

                <!-- optional markdown-notes-tree directory description starts here -->

                This is a description.

                <!-- optional markdown-notes-tree directory description ends here -->
                
                markdownForTree`) + endOfLine;

            const result = fileContents.getNewDirectoryReadmeContents(
                "name",
                currentContents,
                "markdownForTree",
                endOfLine
            );

            const expected =
                dedent(`<!-- generated by markdown-notes-tree -->
                
                # name

                <!-- optional markdown-notes-tree directory description starts here -->

                This is a description.

                <!-- optional markdown-notes-tree directory description ends here -->
                
                markdownForTree`) + endOfLine;

            expect(result).toBe(expected);
        });

        test("it should fail for current contents having invalid markers", () => {
            const currentContents =
                dedent(`<!-- generated by markdown-notes-tree -->
                
                # name

                <!-- optional markdown-notes-tree directory description ends here -->

                <!-- optional markdown-notes-tree directory description starts here -->
                
                markdownForTree`) + endOfLine;

            expect(() =>
                fileContents.getNewDirectoryReadmeContents(
                    "name",
                    currentContents,
                    "markdownForTree",
                    endOfLine
                )
            ).toThrow(
                "Invalid file structure: only one description marker found or end marker found before start marker"
            );
        });
    });
});
