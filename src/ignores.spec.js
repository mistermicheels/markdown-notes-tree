"use strict";

const ignores = require("./ignores");

describe("ignores", () => {
    describe("shouldIgnoreDirectory", () => {
        test("it should return false for normal folders", () => {
            expect(
                ignores.shouldIgnoreDirectory("sub1", "", {
                    ignoredGlobs: [],
                    includeAllDirectoriesByDefault: false
                })
            ).toBe(false);
        });

        test("it should return true if the name starts with .", () => {
            expect(
                ignores.shouldIgnoreDirectory(".test", "", {
                    ignoredGlobs: [],
                    includeAllDirectoriesByDefault: false
                })
            ).toBe(true);
        });

        test("it should return true if the name starts with _", () => {
            expect(
                ignores.shouldIgnoreDirectory("_test", "", {
                    ignoredGlobs: [],
                    includeAllDirectoriesByDefault: false
                })
            ).toBe(true);
        });

        test("it should return true if the name is node_modules", () => {
            expect(
                ignores.shouldIgnoreDirectory("node_modules", "", {
                    ignoredGlobs: [],
                    includeAllDirectoriesByDefault: false
                })
            ).toBe(true);
        });

        test("it should return false if the folder should be ignored by default but includeAllDirectoriesByDefault is set to true", () => {
            expect(
                ignores.shouldIgnoreDirectory(".test", "", {
                    ignoredGlobs: [],
                    includeAllDirectoriesByDefault: true
                })
            ).toBe(false);
        });

        test("it should return true if the folder matches an ignored glob", () => {
            expect(
                ignores.shouldIgnoreDirectory("exclude-this-folder", "parent", {
                    ignoredGlobs: ["parent/exclude-this-folder"],
                    includeAllDirectoriesByDefault: false
                })
            ).toBe(true);
        });

        test("it should always ignore the folder if it matches an ignored glob, even if it's affected by includeAllDirectoriesByDefault", () => {
            expect(
                ignores.shouldIgnoreDirectory("node_modules", "", {
                    ignoredGlobs: ["node_modules"],
                    includeAllDirectoriesByDefault: true
                })
            ).toBe(true);
        });
    });

    describe("shouldIgnoreFile", () => {
        test("it should return false for normal files", () => {
            expect(ignores.shouldIgnoreFile("test.md", "", { ignoredGlobs: [] })).toBe(false);
        });

        test("it should return true for non-Markdown files", () => {
            expect(ignores.shouldIgnoreFile("test.js", "", { ignoredGlobs: [] })).toBe(true);
        });

        test("it should return true for README.md files", () => {
            expect(ignores.shouldIgnoreFile("README.md", "", { ignoredGlobs: [] })).toBe(true);
        });

        test("it should return true if the file matches an ignored glob", () => {
            expect(
                ignores.shouldIgnoreFile("test.md", "exclude-this-folder", {
                    ignoredGlobs: ["exclude-this-folder/*.md"]
                })
            ).toBe(true);
        });
    });
});
