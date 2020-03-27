"use strict";

const optionsParser = require("./options-parser");

describe("optionsParser", () => {
    describe("getOptions", () => {
        test("it should return the default options if no arguments are specified", () => {
            const options = optionsParser.getOptions([]);

            expect(options).toEqual(optionsParser.defaultOptions);
        });

        test("it should allow passing a single glob to ignore", () => {
            const options = optionsParser.getOptions(["--ignore", "**/test.md"]);

            expect(options.ignore).toEqual(["**/test.md"]);
        });

        test("it should allow passing multiple globs to ignore", () => {
            const options = optionsParser.getOptions([
                "--ignore",
                "**/test.md",
                "--ignore",
                "CONTRIBUTING.md"
            ]);

            expect(options.ignore).toEqual(["**/test.md", "CONTRIBUTING.md"]);
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

            expect(options.ignore).toEqual(["**/test.md"]);
            expect(options.linkToSubdirectoryReadme).toBe(true);
        });

        test("it should fail for unknown arguments", () => {
            expect(() => optionsParser.getOptions(["--silnt"])).toThrow("Unknown argument silnt");
        });

        test("it should fail for incorrect use of arguments", () => {
            expect(() => optionsParser.getOptions(["--silent", "3"])).toThrow(
                "Unexpected use of argument silent"
            );
        });
    });
});
