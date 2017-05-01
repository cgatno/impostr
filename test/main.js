const { impostr } = require('../build/impostr');

const cache = impostr();

cache.pruneLibrary();

cache.persist();
