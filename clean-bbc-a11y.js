const fs = require('fs');

try {
  fs.unlinkSync('a11y.js');
} catch (e) {}

