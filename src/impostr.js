/* eslint import/prefer-default-export: off */

import TrackingCache from './lib/TrackingCache';

export function impostr(cacheLibraryPath = './impostr.json') {
  return new TrackingCache(cacheLibraryPath);
}
