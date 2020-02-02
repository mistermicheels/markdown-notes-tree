"use strict";

const os = require("os");

const optionsParser = require("./options-parser");
const logger = require("./logger");
const treeBuilder = require("./tree-builder");
const treeWriter = require("./tree-writer");

module.exports = { execute };

/** Note: this function is not intended to be run in parallel */
function execute(commandLineArguments = [], overrides = { silent: false }) {
    const endOfLine = os.EOL;
    const options = optionsParser.getOptions(commandLineArguments);

    if (overrides.silent) {
        logger.disableLogging();
    }

    logger.log("Processing files in order to build notes tree");
    const tree = treeBuilder.buildTree(options);

    logger.log("Writing notes tree to main README file");
    treeWriter.writeTreeToMainReadme(tree, endOfLine, options);

    if (!options.noSubdirectoryTrees) {
        logger.log("Writing trees for directories");
        treeWriter.writeTreesForDirectories(tree, endOfLine, options);
    }

    logger.log("Finished execution");
}
