Project status:

-   ✅ Actively maintained
-   🐢 Limited bandwidth
-   🔒 Not looking for code contributions from other developers

# markdown-notes-tree

[![npm](https://img.shields.io/npm/v/markdown-notes-tree?style=flat)](https://www.npmjs.com/package/markdown-notes-tree)

If you have a folder structure with Markdown notes, you can use this tool to generate Markdown trees that act as a table of contents for the folder structure.

[Example input and expected result](test-data/basics)

[Real-life example](https://github.com/mistermicheels/learning-notes#readme)

By default, the tool does the following:

-   Append a complete tree to the main `README.md` file (in the directory where the tool is executed)
-   Write/overwrite `README.md` files in subdirectories, each containing the subdirectory's name as title and a tree of the subdirectory's contents (can be disabled through command line arguments)

You can run the tool again and again without changing the result. Once a tree has been written to your main `README.md` file, you can add anything below the tree (or move the tree) and the tool will respect the tree's boundaries.

Of course, it is recommended to run the tool again every time you make changes to the Markdown notes in your folder structure. It can be useful to include the tool in build scripts or pre-commit hooks.

## Install

```
npm install -D markdown-notes-tree
```

Not using Node for your project? You can install `markdown-notes-tree` globally, or you can even add it as a [pre-commit plugin](https://pre-commit.com/#plugins).

Example pre-commit configuration:

```
repos:
-   repo: https://github.com/mistermicheels/markdown-notes-tree
    rev: v1.12.0
    hooks:
    -   id: markdown-notes-tree
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

## Note titles from YAML front matter

Normally, the tool expects to find the note's title as the first level 1 Markdown heading in the file.

However, if a note starts with YAML front matter that has a `tree_title` attribute, the value of `tree_title` will be used as the note's title in the tree.

## Subdirectory descriptions

The generated `README.md` files for subdirectories provide some space to add a description for the directory. If a description is provided, it will be preserved and it will also be included in generated trees containing the directory.

## Subdirectory titles

By default, the generated `README.md` files for subdirectories use the subdirectory's name as title. If you change this into a custom title, that custom title will be preserved and it will be used in the tree instead of the name of the subdirectory.

## Extra content in subdirectory README

If you add content to the generated `README.md` files for subdirectories before the title or between the title and the description, that content will be preserved. This could be useful for image headers etc.

## Command line arguments

### `--allowMissingTitle`

Don't throw an error on missing title but instead use the file name as fallback.

Example: `markdown-notes-tree --allowMissingTitle`

### `--ignore`

Specify glob pattern for additional files or folders to ignore. You can use this argument multiple times in order to specify multiple glob patterns.

Example: `markdown-notes-tree --ignore **/CONTRIBUTING.md`

Example: `markdown-notes-tree --ignore CONTRIBUTING.md --ignore sub1/CONTRIBUTING.md`

Example: `markdown-notes-tree --ignore exclude-this-folder`

### `--includeAllDirectoriesByDefault`

Include all directories by default (don't apply the default ignored folders listed above). You can combine this with custom ignores as needed.

Example: `markdown-notes-tree --includeAllDirectoriesByDefault --ignore node_modules`

### `--includeUpwardNavigation`

Add "Go one level up" and "Go to top level" links at the top of subdirectory README files. If the `--linkToSubdirectoryReadme` option is enabled, these will link directly to README files. Otherwise, they will link to directories.

Note: By design, `markdown-notes-tree` only ever touches the README files and not the actual notes. Upward navigation links will not be added to the notes.

Example: `markdown-notes-tree --includeUpwardNavigation`

### `--linkToSubdirectoryReadme`

When linking to a subdirectory, link directly to its `README.md` file. Note that this assumes that each subdirectory will actually have a `README.md` file. By default, the tool generates these automatically.

Example: `markdown-notes-tree --linkToSubdirectoryReadme`

### `--noSubdirectoryTrees`

Don't write `README.md` files to subdirectories. Any existing `README.md` files in subdirectories will be ignored.

Example: `markdown-notes-tree --noSubdirectoryTrees`

### `--notesBeforeDirectories`

If a directory contains both notes and subdirectories, put the notes before the subdirectories in he tree. By default, it's the other way around.

Example: `markdown-notes-tree --notesBeforeDirectories`

### `--numberSpaces`

Specify the number of spaces to use for indentation (the default is 4).

Example: `markdown-notes-tree --numberSpaces 2`

### `--orderNotesByTitle`

Order notes in the same (sub)directory by title instead of by filename.

Example: `markdown-notes-tree --orderNotesByTitle`

### `--readmeFilename`

Filename to use for README files (both the main README file and subdirectory README files). The default is `README.md`.

Example: `markdown-notes-tree --readmeFilename Home.md`

### `--silent`

Don't log to the console during execution.

Example: `markdown-notes-tree --silent`

### `--subdirectoryDescriptionOnNewLine`

If subdirectory descriptions are provided, put them on a new line in the tree.

Example: `markdown-notes-tree --subdirectoryDescriptionOnNewLine`

### `--useTabs`

Use tabs (instead of the standard four spaces) for indentation.

Example: `markdown-notes-tree --useTabs`

## Known limitations

-   The tool does not support Markdown links inside the titles of notes and subdirectory README files
    -   This is intentional, because these titles will be turned into links by the tool and Markdown does not support nested links
    -   As a workaround, HTML links can be used ([example](test-data/subdirectory-title-rich-text/expected/sub2/sub2b/README.md))
-   Subdirectory descriptions can only be a single paragraph, nothing more

## Development

This project is using Prettier to format the JavaScript code. Installing the VS Code plugin recommended through the `extensions.json` file should make this easy.

The build script verifies that the formatting actually matches Prettier style and that the unit and integration tests are passing.

During development, you can run the tool on a folder by navigating to the folder in the command line and then executing `node path/to/cli.js`, adding arguments as needed. Example: `node ../../../cli.js --silent`

### Markdown processing approach

-   When examining existing Markdown, use actual parsed AST where possible
-   For content generated by the tool, use AST for generation where practical
    -   Complication: we need to retain some level of control over line endings, indentation, ...
-   For user-maintained content, prefer reusing existing content instead of regenerating (the latter might change formatting syntax, for example `*` vs `_` for emphasis)
