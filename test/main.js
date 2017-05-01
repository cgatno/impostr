const { impostr } = require('../build/impostr');

const cache = impostr();

console.log(cache.updateLibrary());

cache.persist();
