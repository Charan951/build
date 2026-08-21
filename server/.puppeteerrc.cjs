const { join } = require('path');

// Render's build and runtime share the project directory but not the default
// HOME cache dir (/opt/render/.cache), so Puppeteer's downloaded Chrome from
// the build step is invisible at runtime. Pointing the cache inside the
// project keeps it in the same persisted location for both phases.
module.exports = {
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
