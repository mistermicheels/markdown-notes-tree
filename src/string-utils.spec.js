"use strict";

const stringUtils = require("./string-utils");

describe("stringUtils", () => {
    describe("compareIgnoringCaseAndDiacritics", () => {
        function getSortedArray(array) {
            // clone the array because .sort() sorts in place
            const sorted = [...array];

            return sorted.sort((a, b) => stringUtils.compareIgnoringCaseAndDiacritics(a, b));
        }

        test("should ignore case", () => {
            const array = ["a", "B", "_", "A", "b"];
            const sorted = getSortedArray(array);
            const expected = ["_", "a", "A", "B", "b"];

            expect(sorted).toEqual(expected);
        });

        test("it should ignore diacritics", () => {
            const array = ["à", "î", "_", "b", "o"];
            const sorted = getSortedArray(array);
            const expected = ["_", "à", "b", "î", "o"];

            expect(sorted).toEqual(expected);
        });
    });
});
