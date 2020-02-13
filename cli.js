#!/usr/bin/env node
"use strict";

const markdownNotesTree = require("./src/index");

const commandLineArguments = process.argv.slice(2);
const logger = message => console.log(message);
markdownNotesTree.execute(commandLineArguments, logger);
