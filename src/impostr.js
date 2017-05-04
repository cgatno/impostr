import TrackingCache from './lib/TrackingCache';

/**
 * Initiates a new TrackingCache object from an existing Impostr JSON library or with a newly
 * generated library.
 * @param  {String} [cacheLibraryPath='./impostr.json'] The path to the Impostr JSON library. If a
 * library already exists at this path, it will be loaded into the cache. Otherwise, a new library
 * will be created. If no path is specified, Impostr will look for 'impostr.json' in the current
 * working directory.
 * @param {Boolean} [debugInDevelopment=true] A Boolean indicating whether or not to log debugging
 * debugging information when NODE_ENV is set to 'development'.
 * @return {Object}                                     A new TrackingCache based on either the
 * newly created or loaded Impostr JSON library.
 */
module.exports = function impostr(cacheLibraryPath = './impostr.json', debugInDevelopment = true) {
  return new TrackingCache(cacheLibraryPath, debugInDevelopment);
};
