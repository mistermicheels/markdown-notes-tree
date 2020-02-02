"use strict";

const os = require("os");

const optionsParser = require("./options-parser");
const treeBuilder = require("./tree-builder");
const treeWriter = require("./tree-writer");

execute();

function execute() {
    const endOfLine = os.EOL;

    const commandLineArguments = process.argv.slice(2);
    const options = optionsParser.getOptions(commandLineArguments);

    console.log("Processing files in order to build notes tree");
    const tree = treeBuilder.buildTree(options);

    console.log("Writing notes tree to main README file");
    treeWriter.writeTreeToMainReadme(tree, endOfLine, options);

    if (!options.noSubdirectoryTrees) {
        console.log("Writing trees for directories");
        treeWriter.writeTreesForDirectories(tree, endOfLine, options);
    }

    console.log("Finished execution");
}
