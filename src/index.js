"use strict";

const os = require("os");

const optionsParser = require("./options-parser");
const treeBuilder = require("./tree-builder");
const treeWriter = require("./tree-writer");

module.exports = { execute };

/** Note: this function is not intended to be run in parallel */
function execute(commandLineArguments, defaultLogger) {
    const options = optionsParser.getOptions(commandLineArguments);
    const logger = getLogger(defaultLogger, options);
    const environment = { options, logger, endOfLine: os.EOL };

    logger("Processing files in order to build notes tree");
    const tree = treeBuilder.buildTree(environment);

    logger("Writing notes tree to main README file");
    treeWriter.writeTreeToMainReadme(tree, environment);

    if (!options.noSubdirectoryTrees) {
        logger("Writing trees for directories");
        treeWriter.writeTreesForDirectories(tree, environment);
    }

    logger("Finished execution");
}

function getLogger(defaultLogger, options) {
    if (options.silent) {
        return () => {};
    } else {
        return defaultLogger;
    }
}
