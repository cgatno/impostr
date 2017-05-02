const { impostr } = require('../build/impostr');

const cache = impostr();

cache.trackFiles('./sample-cache-files/**/*', () => cache.persist());
