# markdown-notes-tree

If you have a folder structure with Markdown notes, you can use this tool to generate Markdown trees that act as a table of contents for the folder structure.

By default, the tool does the following:

-   Append a complete tree to the `README.md` file at the top level (the directory where the tool is executed)
-   Overwrite any `README.md` files in subfolders with a file containing the subfolder's name as title and a tree of the subfolder's contents (can be disabled through command line arguments)

You can run the tool again and again without changing the result. Of course, it is recommended to run the tool again every time you make changes to the Markdown notes in your folder structure. It can be useful to include the tool in build scripts or pre-commit hooks.

[Example input and result](test-data/basics)

## Install

```
npm install -D markdown-notes-tree
```

## Use

You can run the tool by running `npx markdown-notes-tree` from the command line or invoking `markdown-notes-tree` from an npm script.

Make sure to run the tool in the top-level directory of your Markdown notes folder structure.

## Options

There are a limited number of command line arguments available:

-   `--noSubdirectoryTrees`: Don't write `README.md` files to subdirectories. Any existing `README.md` files in subfolders will be ignored.
-   `--useTabs`: Use tabs (instead of the standard four spaces) for indentation.
