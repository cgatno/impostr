const { impostr } = require('../build/impostr');

const cache = impostr();

cache.trackPaths('./sample-cache-files/**/*', () => cache.persist());
