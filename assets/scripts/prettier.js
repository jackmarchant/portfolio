'use strict';

// Based on script from React
// https://github.com/facebook/react/blob/master/scripts/prettier/index.js

const chalk = require('chalk');
const glob = require('glob');
const path = require('path');
const execFileSync = require('child_process').execFileSync;

const mode = process.argv[2] || 'check';
const shouldWrite = mode === 'write' || mode === 'write-changed';
const onlyChanged = mode === 'check-changed' || mode === 'write-changed';

const isWindows = process.platform === 'win32';
const prettier = isWindows ? 'prettier.cmd' : 'prettier';
const prettierCmd = path.resolve(__dirname, '../node_modules/.bin/' + prettier);

const defaultOptions = {
  'single-quote': 'true',
  'jsx-bracket-same-line': 'true',
  'trailing-comma': 'es5',
  'print-width': 80,
};

const config = {
  default: {
    patterns: ['assets/src/**/*.js'],
    ignore: ['**/node_modules/**'],
  },
  scripts: {
    patterns: ['assets/scripts/**/*.js'],
    ignore: ['assets/scripts/bench/benchmarks/**'],
    options: {
      'trailing-comma': 'es5',
    },
  },
};

function exec(command, args) {
  console.log('> ' + [command].concat(args).join(' '));
  var options = {
    cwd: '../',
  };
  return execFileSync(command, args, options).toString();
}

var mergeBase = exec('git', ['merge-base', 'HEAD', 'master']).trim();
var changedFiles = new Set(
  exec('git', [
    'diff',
    '-z',
    '--name-only',
    '--diff-filter=ACMRTUB',
    mergeBase,
  ]).match(/[^\0]+/g)
);

Object.keys(config).forEach(key => {
  const patterns = config[key].patterns;
  const options = config[key].options;
  const ignore = config[key].ignore;

  const globPattern = patterns.length > 1
    ? `{${patterns.join(',')}}`
    : `${patterns.join(',')}`;
  const files = glob
    .sync(globPattern, { ignore, cwd: path.resolve(process.cwd(), '..') })
    .filter(f => !onlyChanged || changedFiles.has(f));

  if (!files.length) {
    return;
  }

  const args = Object.keys(defaultOptions).map(
    k => `--${k}=${(options && options[k]) || defaultOptions[k]}`
  );
  args.push(`--${shouldWrite ? 'write' : 'l'}`);

  try {
    exec(prettierCmd, [...args, ...files]);
  } catch (e) {
    if (!shouldWrite) {
      console.log(
        '\n' +
          chalk.red(
            `  This project uses prettier to format all JavaScript code.\n`
          ) +
          chalk.dim(`    Please run `) +
          chalk.reset('yarn prettier') +
          chalk.dim(` and add changes to files listed above to your commit.`) +
          `\n`
      );
      process.exit(1);
    }
    throw e;
  }
});
