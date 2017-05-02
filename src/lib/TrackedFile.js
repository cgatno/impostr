import fs from 'fs';
import path from 'path';

/** The path and current hash of a file to be tracked by Impostr. */
export default class TrackedFile {
  /**
   * Create a new TrackedFile object to store the path and hash of a file to save in the tracking
   * cache.
   * @param  {string} path      A path to the file. Can be fully qualified, absolute, or relative.
   * @return {Object}           A new TrackedFile object.
   */
  constructor(filePath) {
    try {
      this.path = fs.realpathSync(path.normalize(filePath));
      this.hash = '';
    } catch (readErr) {
      throw readErr;
    }
  }

  /**
   * Converts any valid file path to the format used in Impostr libraries.
   * @param  {[type]} inputPath Any valid file path string.
   * @return {string}           A file path in the format used by the Impostr library.
   */
  static formatAnyPath(inputPath) {
    return fs.realpathSync(path.normalize(inputPath));
  }
}
