# markdown-notes-tree

[![Codecov Coverage](https://img.shields.io/codecov/c/github/mistermicheels/markdown-notes-tree/coverage.svg?style=flat-square)](https://codecov.io/gh/mistermicheels/markdown-notes-tree/)

If you have a folder structure with Markdown notes, you can use this tool to generate Markdown trees that act as a table of contents for the folder structure.

By default, the tool does the following:

-   Append a complete tree to the main `README.md` file (in the directory where the tool is executed)
-   Write/overwrite `README.md` files in subdirectories, each containing the subdirectory's name as title and a tree of the subdirectory's contents (can be disabled through command line arguments)

You can run the tool again and again without changing the result. Once a tree has been written to your main `README.md` file, you can add anything below the tree (or move the tree) and the tool will respect the tree's boundaries.

Of course, it is recommended to run the tool again every time you make changes to the Markdown notes in your folder structure. It can be useful to include the tool in build scripts or pre-commit hooks.

[Example input and result](test-data/basics)

## Install

```
npm install -D markdown-notes-tree
```

## Use

You can run the tool by running `npx markdown-notes-tree` from the command line or invoking `markdown-notes-tree` from an npm script.

Make sure to run the tool in the top-level directory of your Markdown notes folder structure.

## Ignored files and folders

By default, the tool ignores:

-   Folders starting with `.` or `_`
-   `node_modules` folders
-   Files that are not Markdown files

You can customize this using the `--ignore` and `--includeAllDirectoriesByDefault` command line arguments (see below).

## Subdirectory descriptions

The generated `README.md` files for subdirectories provide some space to add a description for the directory. If a description is provided, it will be preserved and it will also be included in generated trees containing the directory.

## Command line arguments

-   `--ignore`: Specify glob pattern for additional files or folders to ignore. You can use this argument multiple times in order to specify multiple glob patterns.
    -   Example: `markdown-notes-tree --ignore **/CONTRIBUTING.md`
    -   Example: `markdown-notes-tree --ignore CONTRIBUTING.md --ignore sub1/CONTRIBUTING.md`
    -   Example: `markdown-notes-tree --ignore exclude-this-folder`
-   `--includeAllDirectoriesByDefault`: Include all directories by default (don't apply the default ignored folders listed above). You can combine this with custom ignores as needed.
    -   Example: `markdown-notes-tree --includeAllDirectoriesByDefault --ignore node_modules`
-   `--linkToSubdirectoryReadme`: When linking to a subdirectory, link directly to its `README.md` file. Note that this assumes that each subdirectory will actually have a `README.md` file. By default, the tool generates these automatically.
    -   Example: `markdown-notes-tree --linkToSubdirectoryReadme`
-   `--noSubdirectoryTrees`: Don't write `README.md` files to subdirectories. Any existing `README.md` files in subdirectories will be ignored.
    -   Example: `markdown-notes-tree --noSubdirectoryTrees`
-   `--notesBeforeDirectories`: If a directory contains both notes and subdirectories, put the notes before the subdirectories in he tree. By default, it's the other way around.
    -   Example: `markdown-notes-tree --notesBeforeDirectories`
-   `--orderNotesByTitle`: Order notes in the same (sub)directory by title instead of by filename.
    -   Example: `markdown-notes-tree --orderNotesByTitle`
-   `--silent`: Don't log to the console during execution.
    -   Example: `markdown-notes-tree --silent`
-   `--subdirectoryDescriptionOnNewLine`: If subdirectory descriptions are provided, put them on a new line in the tree.
    -   Example: `markdown-notes-tree --subdirectoryDescriptionOnNewLine`
-   `--useTabs`: Use tabs (instead of the standard four spaces) for indentation.
    -   Example: `markdown-notes-tree --useTabs`

## Development

This project is using Prettier to format the JavaScript code. Installing the VS Code plugin recommended through the `extensions.json` file should make this easy.

The build script verifies that the formatting actually matches Prettier style and that the unit and integration tests are passing.

During development, you can run the tool on a folder by navigating to the folder in the command line and then executing `node path/to/cli.js`, adding arguments as needed. Example: `node ../../../cli.js --silent`
