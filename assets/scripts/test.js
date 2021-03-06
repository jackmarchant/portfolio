process.env.NODE_ENV = 'test';

const jest = require('jest');
const argv = process.argv.slice(2);

argv.push('--verbose');

// Watch unless on CI
if (!process.env.CI) {
  argv.push('--watch');
} else {
  argv.push('--runInBand');
}

jest.run(argv);
