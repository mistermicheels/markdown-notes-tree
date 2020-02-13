const path = require("path");
const fsExtra = require("fs-extra");
const childProcess = require("child_process");

const markdownNotesTree = require("./src/index");

describe("markdown-notes-tree", () => {
    test("it should have correct basic functionality", () => {
        const resultFolderPath = getTestFolderPath("basics", "result");

        const expectedLogs = [
            "Processing files in order to build notes tree",
            "Writing notes tree to main README file",
            "Writing trees for directories",
            `Writing to ${path.join(resultFolderPath, "sub1", "README.md")}`,
            `Writing to ${path.join(resultFolderPath, "sub1", "sub1a", "README.md")}`,
            `Writing to ${path.join(resultFolderPath, "sub2", "README.md")}`,
            `Writing to ${path.join(resultFolderPath, "sub2", "sub2a", "README.md")}`,
            `Writing to ${path.join(resultFolderPath, "sub2", "sub2b", "README.md")}`,
            "Finished execution"
        ];

        executeTestScenario("basics", [], expectedLogs);
    });

    test("it should preserve content after the tree in the main README", () => {
        executeTestScenario("content-after-main-tree", []);
    });

    test("it should ignore non-relevant files and folders", () => {
        executeTestScenario("default-ignores", []);
    });

    test("it should throw an error if a Markdown file does not start with the title", () => {
        expect(() => executeTestScenario("error-no-title", [])).toThrow(
            /No title found for Markdown file [\S]+\.md/
        );
    });

    test("it should properly order files by file name by default, including support for special characters", () => {
        executeTestScenario("file-order-special-characters", []);
    });

    test("it should allow adding custom file ignores using a single glob expression", () => {
        executeTestScenario("ignore-files", ["--ignore", "**/CONTRIBUTING.md"]);
    });

    test("it should allow adding custom file ignores using multiple glob expressions", () => {
        executeTestScenario("ignore-files", [
            "--ignore",
            "CONTRIBUTING.md",
            "--ignore",
            "sub1/CONTRIBUTING.md"
        ]);
    });

    test("it should allow using a custom ignore to ignore an entire folder", () => {
        executeTestScenario("ignore-folder", ["--ignore", "exclude-this-folder"]);
    });

    test("it should allow linking directly to subdirectory README files", () => {
        executeTestScenario("link-to-subdirectory-readme", ["--linkToSubdirectoryReadme"]);
    });

    test("it should allow not writing subdirectory trees", () => {
        const expectedLogs = [
            "Processing files in order to build notes tree",
            "Writing notes tree to main README file",
            "Finished execution"
        ];

        executeTestScenario("no-subdirectory-trees", ["--noSubdirectoryTrees"], expectedLogs);
    });

    test("it should allow disabling logging", () => {
        const expectedLogs = [];

        executeTestScenario("basics", ["--silent"], expectedLogs);
    });

    test("it should allow ordering notes by title", () => {
        executeTestScenario("order-notes-by-title", ["--orderNotesByTitle"]);
    });

    test("it should allow using tabs for indentation", () => {
        executeTestScenario("use-tabs", ["--useTabs"]);
    });

    function executeTestScenario(folderName, args, expectedLogs = undefined) {
        const inputFolderPath = getTestFolderPath(folderName, "input");
        const expectedFolderPath = getTestFolderPath(folderName, "expected");
        const resultFolderPath = getTestFolderPath(folderName, "result");

        fsExtra.copySync(inputFolderPath, resultFolderPath, {
            overwrite: false,
            errorOnExist: true
        });

        const originalWorkingDirectory = process.cwd();
        changeWorkingDirectoryTo(resultFolderPath);

        try {
            executeAndCheck(args, resultFolderPath, expectedFolderPath, expectedLogs);

            // check that second run doesn't change anything
            executeAndCheck(args, resultFolderPath, expectedFolderPath, expectedLogs);
        } finally {
            changeWorkingDirectoryTo(originalWorkingDirectory);
            fsExtra.removeSync(resultFolderPath);
        }
    }

    function getTestFolderPath(folderName, subfolderName) {
        return path.join(__dirname, "test-data", folderName, subfolderName);
    }

    function changeWorkingDirectoryTo(absolutePath) {
        process.chdir(path.relative(process.cwd(), absolutePath));
    }

    function executeAndCheck(args, resultFolderPath, expectedFolderPath, expectedLogs) {
        const capturedLogs = [];
        const logger = message => capturedLogs.push(message);

        markdownNotesTree.execute(args, logger);
        checkResult(resultFolderPath, expectedFolderPath);

        if (expectedLogs) {
            expect(capturedLogs).toEqual(expectedLogs);
        }
    }

    function checkResult(resultFolderPath, expectedFolderPath) {
        const resultData = getSingleLevelFolderDataForCompare(resultFolderPath);

        const expectedData = getSingleLevelFolderDataForCompare(expectedFolderPath).map(data => ({
            ...data,
            fullPath: expect.anything() // fullPath is only to make it clear for which file the test fails
        }));

        expect(resultData).toEqual(expectedData);

        for (const dataEntry of resultData) {
            if (dataEntry.isDirectory) {
                const deeperResultFolderPath = path.join(resultFolderPath, dataEntry.name);
                const deeperExpectedFolderPath = path.join(expectedFolderPath, dataEntry.name);
                checkResult(deeperResultFolderPath, deeperExpectedFolderPath);
            }
        }
    }

    function getSingleLevelFolderDataForCompare(folderPath) {
        const entries = fsExtra.readdirSync(folderPath, { withFileTypes: true });

        return entries.map(entry => {
            const name = entry.name;
            const fullPath = path.join(folderPath, name);
            const isDirectory = entry.isDirectory();

            let contents;

            if (!isDirectory) {
                contents = fsExtra.readFileSync(fullPath, { encoding: "utf-8" });
            }

            return { name, fullPath, isDirectory, contents };
        });
    }
});
