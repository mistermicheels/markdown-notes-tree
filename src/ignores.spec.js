"use strict";

const ignores = require("./ignores");

describe("ignores", () => {
    describe("shouldIgnoreDirectory", () => {
        test("it should return false for normal folders", () => {
            expect(
                ignores.shouldIgnoreDirectory("sub1", "", {
                    options: {
                        ignore: [],
                        includeAllDirectoriesByDefault: false
                    }
                })
            ).toBe(false);
        });

        test("it should return true if the name starts with .", () => {
            expect(
                ignores.shouldIgnoreDirectory(".test", "", {
                    options: {
                        ignore: [],
                        includeAllDirectoriesByDefault: false
                    }
                })
            ).toBe(true);
        });

        test("it should return true if the name starts with _", () => {
            expect(
                ignores.shouldIgnoreDirectory("_test", "", {
                    options: {
                        ignore: [],
                        includeAllDirectoriesByDefault: false
                    }
                })
            ).toBe(true);
        });

        test("it should return true if the name is node_modules", () => {
            expect(
                ignores.shouldIgnoreDirectory("node_modules", "", {
                    options: {
                        ignore: [],
                        includeAllDirectoriesByDefault: false
                    }
                })
            ).toBe(true);
        });

        test("it should return false if the folder should be ignored by default but includeAllDirectoriesByDefault is set to true", () => {
            expect(
                ignores.shouldIgnoreDirectory(".test", "", {
                    options: {
                        ignore: [],
                        includeAllDirectoriesByDefault: true
                    }
                })
            ).toBe(false);
        });

        test("it should return true if the folder matches an ignored glob", () => {
            expect(
                ignores.shouldIgnoreDirectory("exclude-this-folder", "parent", {
                    options: {
                        ignore: ["parent/exclude-this-folder"],
                        includeAllDirectoriesByDefault: false
                    }
                })
            ).toBe(true);
        });

        test("it should always ignore the folder if it matches an ignored glob, even if it's affected by includeAllDirectoriesByDefault", () => {
            expect(
                ignores.shouldIgnoreDirectory("node_modules", "", {
                    options: {
                        ignore: ["node_modules"],
                        includeAllDirectoriesByDefault: true
                    }
                })
            ).toBe(true);
        });
    });

    describe("shouldIgnoreFile", () => {
        test("it should return false for normal files", () => {
            expect(ignores.shouldIgnoreFile("test.md", "", { options: { ignore: [] } })).toBe(
                false
            );
        });

        test("it should return true for non-Markdown files", () => {
            expect(ignores.shouldIgnoreFile("test.js", "", { options: { ignore: [] } })).toBe(true);
        });

        test("it should return true for README files", () => {
            expect(
                ignores.shouldIgnoreFile("README_FILENAME.md", "", {
                    options: { ignore: [], readmeFilename: "README_FILENAME.md" }
                })
            ).toBe(true);
        });

        test("it should return true if the file matches an ignored glob", () => {
            expect(
                ignores.shouldIgnoreFile("test.md", "exclude-this-folder", {
                    options: {
                        ignore: ["exclude-this-folder/*.md"]
                    }
                })
            ).toBe(true);
        });
    });
});
