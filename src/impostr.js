import TrackingCache from './lib/TrackingCache';

module.exports = function impostr(cacheLibraryPath = './impostr.json') {
  return new TrackingCache(cacheLibraryPath);
};
