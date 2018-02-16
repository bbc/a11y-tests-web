'use strict';

const fs = require('fs');

try {
  fs.unlinkSync('a11y.js');
} catch (e) {
  // Cannot delete file (probably because it does not exist).
}

