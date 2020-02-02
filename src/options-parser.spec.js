"use strict";

const optionsParser = require("./options-parser");

describe("optionsParser", () => {
    describe("getOptions", () => {
        test("it should return the default options if no arguments are specified", () => {
            const defaultOptions = {
                ignoredGlobs: [],
                linkToSubdirectoryReadme: false,
                noSubdirectoryTrees: false,
                orderNotesByTitle: false,
                useTabs: false
            };

            const options = optionsParser.getOptions([]);

            expect(options).toEqual(defaultOptions);
        });

        test("it should allow passing a single glob to ignore", () => {
            const options = optionsParser.getOptions(["--ignore", "**/test.md"]);

            expect(options.ignoredGlobs).toEqual(["**/test.md"]);
        });

        test("it should allow passing multiple globs to ignore", () => {
            const options = optionsParser.getOptions([
                "--ignore",
                "**/test.md",
                "--ignore",
                "CONTRIBUTING.md"
            ]);

            expect(options.ignoredGlobs).toEqual(["**/test.md", "CONTRIBUTING.md"]);
        });

        test("it should allow passing boolean options", () => {
            const options = optionsParser.getOptions(["--linkToSubdirectoryReadme"]);

            expect(options.linkToSubdirectoryReadme).toBe(true);
        });

        test("it should allow combining different options", () => {
            const options = optionsParser.getOptions([
                "--ignore",
                "**/test.md",
                "--linkToSubdirectoryReadme"
            ]);

            expect(options.ignoredGlobs).toEqual(["**/test.md"]);
            expect(options.linkToSubdirectoryReadme).toBe(true);
        });
    });
});
