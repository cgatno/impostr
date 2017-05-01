import fs from 'fs';
import path from 'path';
import revHash from 'rev-hash';

export default class TrackedFile {
  /**
   * Create a new TrackedFile object to store the path and hash of a file to save in the tracking
   * cache.
   * @param  {string} path      A path to the file. Can be fully qualified, absolute, or relative.
   * @return {TrackedFile}
   */
  constructor(filePath) {
    try {
      this.path = fs.realpathSync(path.normalize(filePath));
      this.hash = revHash(fs.readFileSync(this.path));
    } catch (readErr) {
      throw readErr;
    }
  }

  static formatAnyPath(inputPath) {
    return fs.realpathSync(path.normalize(inputPath));
  }
}
