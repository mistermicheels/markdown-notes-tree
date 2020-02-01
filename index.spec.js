const path = require("path");
const fsExtra = require("fs-extra");
const childProcess = require("child_process");

describe("markdown-notes-tree", () => {
    test("it should have correct basic functionality", async () => {
        await executeTestScenario("basics", []);
    });

    test("it should support a tree without end marker in the main README (as written by older versions)", async () => {
        await executeTestScenario("content-after-main-tree", []);
    });

    test("it should preserve content after the tree in the main README", async () => {
        await executeTestScenario("content-after-main-tree", []);
    });

    test("it should ignore non-relevant files and folders", async () => {
        await executeTestScenario("default-ignores", []);
    });

    test("it should throw an error if a Markdown file does not start with the title", async () => {
        await expect(executeTestScenario("error-no-title", [])).rejects.toThrow(
            /No title found for Markdown file [\S]+\.md/
        );
    });

    test("it should allow adding custom file ignores using a single glob expression", async () => {
        await executeTestScenario("ignore-files", ["--ignore", "**/CONTRIBUTING.md"]);
    });

    test("it should allow adding custom file ignores using multiple glob expressions", async () => {
        await executeTestScenario("ignore-files", [
            "--ignore",
            "CONTRIBUTING.md",
            "--ignore",
            "sub1/CONTRIBUTING.md"
        ]);
    });

    test("it should allow using a custom ignore to ignore an entire folder", async () => {
        await executeTestScenario("ignore-folder", ["--ignore", "exclude-this-folder"]);
    });

    test("it should allow linking directly to subdirectory README files", async () => {
        await executeTestScenario("link-to-subdirectory-readme", ["--linkToSubdirectoryReadme"]);
    });

    test("it should allow not writing subdirectory trees", async () => {
        await executeTestScenario("no-subdirectory-trees", ["--noSubdirectoryTrees"]);
    });

    test("it should allow ordering notes by title", async () => {
        await executeTestScenario("order-notes-by-title", ["--orderNotesByTitle"]);
    });

    test("it should allow using tabs for indentation", async () => {
        await executeTestScenario("use-tabs", ["--useTabs"]);
    });

    async function executeTestScenario(folderName, args) {
        const folderPath = path.join(__dirname, "test-data", folderName);
        const inputFolderPath = path.join(folderPath, "input");
        const expectedFolderPath = path.join(folderPath, "expected");
        const resultFolderPath = path.join(folderPath, "result");

        fsExtra.copySync(inputFolderPath, resultFolderPath, {
            overwrite: false,
            errorOnExist: true
        });

        try {
            await runMain(resultFolderPath, args);
            checkResult(resultFolderPath, expectedFolderPath);

            // check that second run doesn't change anything
            await runMain(resultFolderPath, args);
            checkResult(resultFolderPath, expectedFolderPath);
        } finally {
            fsExtra.removeSync(resultFolderPath);
        }
    }

    async function runMain(resultFolderPath, args) {
        return new Promise((resolve, reject) => {
            const forked = childProcess.fork(path.join(__dirname, "index.js"), args || [], {
                cwd: resultFolderPath,
                silent: true
            });

            let receivedErrorText = "";

            forked.stderr.on("data", data => {
                receivedErrorText = receivedErrorText + data.toString();
            });

            forked.on("exit", code => {
                if (code === 0) {
                    resolve();
                } else {
                    // the message will be a lot longer than the original error message, but does the job
                    reject(new Error(receivedErrorText));
                }
            });
        });
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
