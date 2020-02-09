"use strict";

const stringUtils = require("./string-utils");

describe("stringUtils", () => {
    describe("compareIgnoringCaseAndDiacritics", () => {
        function sortArray(array) {
            array.sort((a, b) => stringUtils.compareIgnoringCaseAndDiacritics(a, b));
        }

        test("should ignore case", () => {
            const array = ["a", "B", "_", "A", "b"];
            const expected = ["_", "a", "A", "B", "b"];

            sortArray(array);

            expect(array).toEqual(expected);
        });

        test("it should ignore diacritics", () => {
            const array = ["à", "î", "_", "b", "o"];
            const expected = ["_", "à", "b", "î", "o"];

            sortArray(array);

            expect(array).toEqual(expected);
        });
    });
});
