import TrackingCache from './lib/TrackingCache';

/**
 * Initiates a new TrackingCache object from an existing Impostr JSON library or with a newly
 * generated library.
 * @param  {String} [cacheLibraryPath='./impostr.json'] The path to the Impostr JSON library. If a
 * library already exists at this path, it will be loaded into the cache. Otherwise, a new library
 * will be created. If no path is specified, Impostr will look for 'impostr.json' in the current
 * working directory.
 * @return {Object}                                     A new TrackingCache based on either the
 * newly created or loaded Impostr JSON library.
 */
module.exports = function impostr(cacheLibraryPath = './impostr.json') {
  return new TrackingCache(cacheLibraryPath);
};
