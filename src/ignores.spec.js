const ignoresFunctions = require("./ignores");

describe("ignores functions", () => {
    describe("shouldIgnoreDirectory", () => {
        test("it should return false for normal folders", () => {
            expect(ignoresFunctions.shouldIgnoreDirectory("sub1", "", { ignoredGlobs: [] })).toBe(
                false
            );
        });

        test("it should return true if the name starts with .", () => {
            expect(ignoresFunctions.shouldIgnoreDirectory(".test", "", { ignoredGlobs: [] })).toBe(
                true
            );
        });

        test("it should return true if the name starts with _", () => {
            expect(ignoresFunctions.shouldIgnoreDirectory("_test", "", { ignoredGlobs: [] })).toBe(
                true
            );
        });

        test("it should return true if the name is node_modules", () => {
            expect(
                ignoresFunctions.shouldIgnoreDirectory("node_modules", "", { ignoredGlobs: [] })
            ).toBe(true);
        });

        test("it should return true if the directory matches an ignored glob", () => {
            expect(
                ignoresFunctions.shouldIgnoreDirectory("exclude-this-folder", "parent", {
                    ignoredGlobs: ["parent/exclude-this-folder"]
                })
            ).toBe(true);
        });
    });

    describe("shouldIgnoreFile", () => {
        test("it should return false for normal files", () => {
            expect(ignoresFunctions.shouldIgnoreFile("test.md", "", { ignoredGlobs: [] })).toBe(
                false
            );
        });

        test("it should return true for non-Markdown files", () => {
            expect(ignoresFunctions.shouldIgnoreFile("test.js", "", { ignoredGlobs: [] })).toBe(
                true
            );
        });

        test("it should return true for README.md files", () => {
            expect(ignoresFunctions.shouldIgnoreFile("README.md", "", { ignoredGlobs: [] })).toBe(
                true
            );
        });

        test("it should return true if the file matches an ignored glob", () => {
            expect(
                ignoresFunctions.shouldIgnoreFile("test.md", "exclude-this-folder", {
                    ignoredGlobs: ["exclude-this-folder/*.md"]
                })
            ).toBe(true);
        });
    });
});
