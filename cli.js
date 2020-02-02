#!/usr/bin/env node
"use strict";

const markdownNotesTree = require("./src/index");

const commandLineArguments = process.argv.slice(2);
markdownNotesTree.execute(commandLineArguments);
