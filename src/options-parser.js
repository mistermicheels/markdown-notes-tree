const minimist = require('minimist');

const defaultOptions = {
  ignore: [],
  includeAllDirectoriesByDefault: false,
  linkToSubdirectoryReadme: false,
  noSubdirectoryTrees: false,
  notesBeforeDirectories: false,
  numberSpaces: 4,
  orderNotesByTitle: false,
  silent: false,
  subdirectoryDescriptionOnNewLine: false,
  useTabs: false,
  readmeFileName: 'README.md'
};

module.exports = { getOptions, defaultOptions };

// minimist adds a key _ by default
const argumentsKeysToIgnore = ['_'];

function getOptions(commandLineArguments) {
  const parsedArguments = minimist(commandLineArguments);
  parsedArguments.ignore = makeStringArray(parsedArguments.ignore);

  const options = { ...defaultOptions };

  for (const key in parsedArguments) {
    const keyIsKnown = key in defaultOptions;

    if (keyIsKnown && isSameType(parsedArguments[key], defaultOptions[key])) {
      options[key] = parsedArguments[key];
    } else if (keyIsKnown) {
      throw new Error(`Unexpected use of argument ${key}`);
    } else if (!argumentsKeysToIgnore.includes(key)) {
      throw new Error(`Unknown argument ${key}`);
    }
  }

  return options;
}

function makeStringArray(value) {
  if (!value) {
    return [];
  }
  if (!Array.isArray(value)) {
    return [value.toString()];
  }
  return value.map((entry) => entry.toString());
}

function isSameType(a, b) {
  return Object.prototype.toString.apply(a) === Object.prototype.toString.apply(b);
}
